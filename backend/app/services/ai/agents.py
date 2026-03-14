from typing import Annotated, TypedDict, List
from langgraph.graph import StateGraph, END
from app.services.ai.sentiment import sentiment_service
from app.services.ai.chatbot import chatbot_service # Your existing RAG logic
from app.db.mongodb import db_instance
from app.models.ticket import TicketStatus
from datetime import datetime

# 1. Define the State (The shared memory between agents)
class AgentState(TypedDict):
    query: str
    sentiment: str
    sentiment_score: float
    context: str
    answer: str
    needs_ticket: bool
    user_data: dict

# 2. Sentiment Agent: Analyzes the mood
def sentiment_agent(state: AgentState):
    sentiment, score = sentiment_service.analyze(state["query"])
    return {
        "sentiment": sentiment, 
        "sentiment_score": score,
        "needs_ticket": True if (sentiment == "negative" and score > 0.8) else False
    }

# 3. Retrieval Agent: Finds docs in Pinecone
def retrieval_agent(state: AgentState):
    if state["needs_ticket"]:
        return {"context": "Escalating to human."}
    # Use your existing Pinecone logic
    docs = chatbot_service.vectorstore.similarity_search(state["query"], k=3)
    context = "\n".join([d.page_content for d in docs])
    return {"context": context}

# 4. Response Agent: Generates the final message
def response_agent(state: AgentState):
    if state["needs_ticket"]:
        answer = "I'm sorry you're having trouble. I'm opening a priority support ticket for you now."
    else:
        answer = chatbot_service.get_rag_response(state["query"])
    return {"answer": answer}

# 5. Ticket Agent: Handles DB persistence
async def ticket_agent(state: AgentState):
    if state["needs_ticket"]:
        ticket = {
            "user_id": str(state["user_data"]["_id"]),
            "message": state["query"],
            "sentiment_score": state["sentiment_score"],
            "ticket_status": TicketStatus.OPEN,
            "created_at": datetime.utcnow()
        }
        await db_instance.db["tickets"].insert_one(ticket)
    return state

# 6. Define the Logic Graph
workflow = StateGraph(AgentState)

workflow.add_node("analyze_sentiment", sentiment_agent)
workflow.add_node("retrieve_info", retrieval_agent)
workflow.add_node("generate_response", response_agent)
workflow.add_node("manage_tickets", ticket_agent)

workflow.set_entry_point("analyze_sentiment")
workflow.add_edge("analyze_sentiment", "retrieve_info")
workflow.add_edge("retrieve_info", "generate_response")
workflow.add_edge("generate_response", "manage_tickets")
workflow.add_edge("manage_tickets", END)

# Compile the graph
agent_app = workflow.compile()