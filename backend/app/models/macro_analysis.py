from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class MacroAnalysisRequest(BaseModel):
    symbol: str
    timeframe: str = "1d"

class CorrelationData(BaseModel):
    asset_1: str
    asset_2: str
    correlation: float
    strength: str
    interpretation: str

class CorrelationsAnalysis(BaseModel):
    btc_eth_correlation: CorrelationData
    btc_market_correlation: Optional[CorrelationData]
    trend_alignment: str
    score: int

class NewsItem(BaseModel):
    title: str
    sentiment: str
    source: str
    published_at: str
    currencies: List[str]

class NewsAnalysis(BaseModel):
    recent_news: List[NewsItem]
    overall_sentiment: str
    sentiment_score: float
    news_count: int
    score: int

class DominanceAnalysis(BaseModel):
    btc_dominance: float
    trend: str
    interpretation: str
    score: int

class MacroAnalysisResponse(BaseModel):
    symbol: str
    timeframe: str
    current_price: float
    timestamp: str
    correlations: CorrelationsAnalysis
    news: NewsAnalysis
    dominance: DominanceAnalysis
    total_score: int
    max_score: int = 5
    confidence_percentage: float
    recommendation: str
    summary: str