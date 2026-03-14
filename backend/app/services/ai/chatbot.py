from datetime import datetime
from langchain_openai import OpenAIEmbeddings, ChatOpenAI
from langchain_community.vectorstores import Pinecone as LangChainPinecone
from langchain.chains import RetrievalQA
from langchain_core.prompts import PromptTemplate
from app.core.config import settings
from app.services.ai.sentiment import sentiment_service
from app.db.mongodb import db_instance
from app.models.ticket import TicketStatus

class ChatbotService:
    def __init__(self):
        self.embeddings = OpenAIEmbeddings(openai_api_key=settings.OPENAI_API_KEY)
        self.llm = ChatOpenAI(
            openai_api_key=settings.OPENAI_API_KEY,
            model_name="gpt-3.5-turbo",
            temperature=0
        )

    def get_response(self, query: str):
        # Initialize vectorstore inside the method to bypass Pydantic class validation
        vectorstore = LangChainPinecone.from_existing_index(
            index_name=settings.PINECONE_INDEX_NAME,
            embedding=self.embeddings
        )

        template = """
        You are a professional Customer Support Assistant. 
        Use the following context to answer. If you don't know, suggest human support.
        Context: {context}
        Question: {question}
        Answer:"""
        
        QA_CHAIN_PROMPT = PromptTemplate(input_variables=["context", "question"], template=template)

        qa_chain = RetrievalQA.from_chain_type(
            self.llm,
            chain_type="stuff",
            retriever=vectorstore.as_retriever(search_kwargs={"k": 3}),
            chain_type_kwargs={"prompt": QA_CHAIN_PROMPT}
        )

        result = qa_chain.invoke({"query": query})
        return result["result"]

    async def get_response_with_sentiment(self, query: str, user: dict):
        # 1. Sentiment & RAG
        sentiment, score = sentiment_service.analyze(query)
        ai_answer = self.get_response(query)

        # 2. Log History
        await db_instance.db["chat_history"].insert_one({
            "user_id": str(user["_id"]),
            "query": query,
            "response": ai_answer,
            "sentiment": sentiment,
            "timestamp": datetime.utcnow()
        })

        # 3. Simple Escalation
        if sentiment == "negative" and score > 0.7:
            await db_instance.db["tickets"].insert_one({
                "user_id": str(user["_id"]),
                "message": query,
                "ticket_status": TicketStatus.OPEN,
                "created_at": datetime.utcnow()
            })
            ai_answer += "\n\n(Note: I've opened a support ticket for you.)"

        return ai_answer

chatbot_service = ChatbotService()