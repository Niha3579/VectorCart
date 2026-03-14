from transformers import pipeline

class SentimentAnalyzer:
    def __init__(self):
        # Initializing the pipeline (downloads the model on first run)
        self.classifier = pipeline(
            "sentiment-analysis", 
            model="distilbert-base-uncased-finetuned-sst-2-english"
        )

    def analyze(self, text: str):
        result = self.classifier(text)[0]
        label = result['label'].lower()  # 'positive' or 'negative'
        score = result['score']
        
        # Mapping to our Positive/Neutral/Negative requirements
        # DistilBERT is binary, so we treat mid-range scores as neutral
        if score < 0.6:
            return "neutral", score
        return label, score

sentiment_service = SentimentAnalyzer()