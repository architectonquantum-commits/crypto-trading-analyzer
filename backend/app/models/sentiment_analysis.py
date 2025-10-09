from pydantic import BaseModel
from typing import List, Optional

class SentimentAnalysisRequest(BaseModel):
    symbol: str
    timeframe: str = "1h"

class SocialSentiment(BaseModel):
    platform: str
    sentiment_score: float
    mentions_count: int
    trend: str

class SocialAnalysis(BaseModel):
    overall_score: float
    platforms: List[SocialSentiment]
    interpretation: str
    score: int

class FundingRate(BaseModel):
    exchange: str
    rate: float
    next_funding_time: str

class FundingAnalysis(BaseModel):
    average_rate: float
    rates: List[FundingRate]
    interpretation: str
    score: int

class VolumeOIAnalysis(BaseModel):
    volume_24h: float
    volume_change_pct: float
    open_interest: Optional[float]
    oi_change_pct: Optional[float]
    interpretation: str
    score: int

class SentimentAnalysisResponse(BaseModel):
    symbol: str
    timeframe: str
    current_price: float
    timestamp: str
    social: SocialAnalysis
    funding: FundingAnalysis
    volume_oi: VolumeOIAnalysis
    total_score: int
    max_score: int = 4
    confidence_percentage: float
    recommendation: str
    summary: str