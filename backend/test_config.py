from app.core.config import settings
from pinecone import Pinecone
import openai

def test_connections():
    try:
        # Test Pinecone
        pc = Pinecone(api_key=settings.PINECONE_API_KEY)
        index = pc.Index(settings.PINECONE_INDEX_NAME)
        stats = index.describe_index_stats()
        print("✅ Pinecone Connected! Index Stats:", stats)

        # Test OpenAI
        client = openai.OpenAI(api_key=settings.OPENAI_API_KEY)
        response = client.models.list()
        print("✅ OpenAI Connected! Models available.")
        
    except Exception as e:
        print("❌ Connection Failed:", str(e))

if __name__ == "__main__":
    test_connections()