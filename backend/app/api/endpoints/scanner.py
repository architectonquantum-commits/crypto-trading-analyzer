# backend/app/api/endpoints/scanner.py
from fastapi import APIRouter, HTTPException
from app.models.scanner import ScannerRequest, ScannerResponse
from app.services.scanner_service import ScannerService

router = APIRouter()

@router.post("/run", response_model=ScannerResponse)
async def run_scanner(request: ScannerRequest):
    """
    Escanea 23 criptomonedas principales y las ordena por confluencias
    
    Criptos analizadas:
    BTC, ETH, XRP, SOL, ADA, LINK, DOT, AVAX, MATIC, UNI,
    LTC, ALGO, ATOM, XLM, DOGE, AAVE, SNX, FIL, VET, ETC,
    TRX, SUSHI, BCH
    
    Cada cripto se analiza con los 5 módulos (25 puntos totales)
    
    Parámetros:
    - timeframe: Timeframe de análisis (1h, 4h, 1d)
    - min_confluence: Filtro mínimo de confluencias (default 70%)
    
    Retorna top 10 oportunidades ordenadas por confluencias
    """
    try:
        scanner = ScannerService()
        result = await scanner.scan_all_cryptos(request)
        return result
    except Exception as e:
        import traceback
        error_detail = traceback.format_exc()
        print("ERROR SCANNER:")
        print(error_detail)
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/test")
async def test_scanner():
    """
    Test rápido del scanner con confluencia baja para ver resultados
    """
    try:
        scanner = ScannerService()
        test_request = ScannerRequest(timeframe="1h", min_confluence=50.0)
        result = await scanner.scan_all_cryptos(test_request)
        return result
    except Exception as e:
        import traceback
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/status")
async def scanner_status():
    """Estado del scanner y configuración"""
    scanner = ScannerService()
    return scanner.get_scanner_status()
