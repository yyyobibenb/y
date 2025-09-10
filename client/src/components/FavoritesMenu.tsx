import React from "react";
import { Button } from "@/components/ui/button";
import { Heart, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getLanguage } from "@/lib/i18n";

interface FavoriteMatch {
  id: string;
  matchId: string;
  sport: string;
  league: string;
  homeTeam: string;
  awayTeam: string;
  startTime: string;
  status: string;
  createdAt: string;
}

interface FavoritesMenuProps {
  favorites: FavoriteMatch[];
  onMatchClick: (match: FavoriteMatch) => void;
}

export default function FavoritesMenu({ favorites, onMatchClick }: FavoritesMenuProps) {
  const language = getLanguage();

  // Always show the menu, even if empty

  const formatTime = (startTime: string) => {
    const date = new Date(startTime);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  const getStatusBadge = (status: string, startTime: string) => {
    if (['1H', '2H', 'HT', 'LIVE', 'Q1', 'Q2', 'Q3', 'Q4', 'OT', 'ET', 'P', 'H1', 'H2', '1', '2', '3', '4', '5'].includes(status)) {
      return (
        <Badge variant="destructive" className="text-xs animate-live-pulse">
          {language === 'th' ? 'สด' : 'LIVE'}
        </Badge>
      );
    }
    if (status === 'finished') {
      return (
        <Badge variant="secondary" className="text-xs">
          {language === 'th' ? 'จบ' : 'FT'}
        </Badge>
      );
    }
    return (
      <div className="flex items-center text-xs text-muted-foreground">
        <Clock className="h-3 w-3 mr-1" />
        {formatTime(startTime)}
      </div>
    );
  };

  return (
    <div className="bg-card rounded-lg p-4 mt-4 border border-border">
      <div className="flex items-center gap-2 mb-3">
        <Heart className="h-4 w-4 text-red-500 fill-current" />
        <h3 className="text-sm font-semibold">
          {language === 'th' ? 'แมตช์ที่ชื่นชอบ' : 'Favorite Matches'}
        </h3>
        <Badge variant="outline" className="text-xs">
          {favorites.length}
        </Badge>
      </div>
      
      <div className="space-y-2 max-h-60 overflow-y-auto">
        {favorites.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">
            <Heart className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-xs">
              {language === 'th' ? 'ยังไม่มีแมตช์ที่ชื่นชอบ' : 'No favorite matches yet'}
            </p>
            <p className="text-xs mt-1">
              {language === 'th' ? 'คลิกที่ไอคอนหัวใจเพื่อเพิ่ม' : 'Click the heart icon to add'}
            </p>
          </div>
        ) : (
          favorites.map((match) => (
          <div
            key={match.id}
            className="bg-muted rounded-md p-3 cursor-pointer hover:bg-muted/80 transition-colors"
            onClick={() => onMatchClick(match)}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground truncate">
                {match.league}
              </span>
              {getStatusBadge(match.status, match.startTime)}
            </div>
            
            <div className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium truncate pr-2">
                  {match.homeTeam}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium truncate pr-2">
                  {match.awayTeam}
                </span>
              </div>
            </div>
          </div>
        ))
        )}
      </div>
    </div>
  );
}