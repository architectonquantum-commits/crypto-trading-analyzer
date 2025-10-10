
@router.post("/temporal-analysis")
async def analyze_temporal_consistency(request: dict):
    """Analiza la consistencia temporal de los trades"""
    try:
        trades = request.get("trades", [])
        
        if len(trades) < 20:
            return {
                "success": False,
                "message": "Se necesitan al menos 20 trades para análisis temporal"
            }
        
        # Agrupar por hora
        hourly_stats = {}
        for trade in trades:
            try:
                # Extraer hora de entry_time
                if isinstance(trade.get("entry_time"), str):
                    hour = int(trade["entry_time"].split(" ")[1].split(":")[0])
                else:
                    continue
                    
                if hour not in hourly_stats:
                    hourly_stats[hour] = {
                        "trades": 0,
                        "wins": 0,
                        "total_pnl": 0
                    }
                
                hourly_stats[hour]["trades"] += 1
                if trade.get("outcome") == "win":
                    hourly_stats[hour]["wins"] += 1
                hourly_stats[hour]["total_pnl"] += trade.get("pnl", 0)
            except:
                continue
        
        # Calcular métricas por hora
        hourly_performance = []
        for hour, stats in hourly_stats.items():
            if stats["trades"] >= 3:  # Mínimo 3 trades para considerar
                win_rate = (stats["wins"] / stats["trades"]) * 100
                avg_pnl = stats["total_pnl"] / stats["trades"]
                
                hourly_performance.append({
                    "hour": hour,
                    "trades": stats["trades"],
                    "win_rate": round(win_rate, 1),
                    "avg_pnl": round(avg_pnl, 2),
                    "total_pnl": round(stats["total_pnl"], 2)
                })
        
        # Ordenar por win_rate
        hourly_performance.sort(key=lambda x: x["win_rate"], reverse=True)
        
        # Mejores y peores horas
        best_hours = hourly_performance[:3] if len(hourly_performance) >= 3 else hourly_performance
        worst_hours = hourly_performance[-3:] if len(hourly_performance) >= 3 else []
        
        # Calcular potencial de optimización
        total_wr = sum(t.get("outcome") == "win" for t in trades) / len(trades) * 100
        best_wr = best_hours[0]["win_rate"] if best_hours else total_wr
        
        return {
            "success": True,
            "data": {
                "best_hours": best_hours,
                "worst_hours": worst_hours,
                "current_win_rate": round(total_wr, 1),
                "optimized_win_rate": round(best_wr, 1),
                "improvement_potential": round(((best_wr - total_wr) / total_wr * 100), 1) if total_wr > 0 else 0,
                "total_trades_analyzed": len(trades)
            }
        }
        
    except Exception as e:
        print(f"Error en análisis temporal: {e}")
        return {
            "success": False,
            "message": str(e)
        }
