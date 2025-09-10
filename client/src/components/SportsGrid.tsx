import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Heart, Clock } from "lucide-react";
import { useBetting } from "@/hooks/use-betting";
import { useWebSocket } from "@/hooks/use-websocket";
import { getLanguage } from "@/lib/i18n";
import MatchModal from "@/components/MatchModal";
import FavoritesMenu from "@/components/FavoritesMenu";

interface SportsGridProps {
  urlSection?: string | null;
}

export default function SportsGrid({ urlSection }: SportsGridProps) {
  const [selectedSport, setSelectedSport] = useState<string>("all");
  const [showLive, setShowLive] = useState<boolean>(false);
  
  // Handle URL section parameter
  useEffect(() => {
    if (urlSection === 'live') {
      setShowLive(true);
      setSelectedSport('all');
    } else if (urlSection === 'thai-sports') {
      setShowLive(false);
      setSelectedSport('thai-football');
    } else {
      setShowLive(false);
      setSelectedSport('all');
    }
  }, [urlSection]);
  const [selectedMatch, setSelectedMatch] = useState<any>(null);
  const [isMatchModalOpen, setIsMatchModalOpen] = useState<boolean>(false);
  const { addToBettingSlip } = useBetting();
  const language = getLanguage();
  const queryClient = useQueryClient();

  // Use WebSocket for live updates
  useWebSocket();

  // Fetch user favorites
  const { data: favorites = [] } = useQuery({
    queryKey: ["/api/favorites"],
    queryFn: async () => {
      const response = await fetch('/api/favorites');
      if (!response.ok) {
        if (response.status === 401) return []; // Not logged in
        throw new Error('Failed to fetch favorites');
      }
      return response.json();
    },
    retry: false,
  });

  // Add favorite mutation
  const addFavoriteMutation = useMutation({
    mutationFn: async (matchData: any) => {
      const response = await fetch('/api/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          matchId: matchData.id.toString(),
          sport: matchData.sport || 'football',
          league: matchData.league || '',
          homeTeam: matchData.teams?.home || matchData.homeTeam || '',
          awayTeam: matchData.teams?.away || matchData.awayTeam || '',
          startTime: new Date(matchData.date || Date.now()).toISOString(),
          status: matchData.status || 'scheduled'
        }),
      });
      if (!response.ok) throw new Error('Failed to add favorite');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/favorites"] });
    },
  });

  // Remove favorite mutation
  const removeFavoriteMutation = useMutation({
    mutationFn: async (matchId: string) => {
      const response = await fetch(`/api/favorites/${matchId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to remove favorite');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/favorites"] });
    },
  });

  // Use new live-feed API with forced refresh  
  const { data: liveFeedData, isLoading } = useQuery({
    queryKey: ["/api/live-feed"],
    queryFn: async () => {
      const response = await fetch('/api/live-feed?t=' + Date.now());
      const data = await response.json();
      console.log('✅ Live feed data received:', data?.sports ? Object.keys(data.sports).map(sport => `${sport}: ${data.sports[sport]?.length || 0} matches`).join(', ') : 'No sports data');
      return data;
    },
    refetchInterval: 300000, // Refresh every 5 minutes
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    staleTime: 0, // Always fetch fresh data
  });

  // Extract fixtures from live feed data
  const fixtures = React.useMemo(() => {
    if (!liveFeedData?.sports) return [];
    
    let allFixtures: any[] = [];
    
    if (selectedSport === 'all') {
      // Show all sports
      Object.values(liveFeedData.sports).forEach((sportFixtures: any) => {
        if (Array.isArray(sportFixtures)) {
          allFixtures = allFixtures.concat(sportFixtures);
        }
      });
    } else if (selectedSport === 'thai-football') {
      // Show only Thai football
      const footballFixtures = liveFeedData.sports.football || [];
      allFixtures = footballFixtures.filter((fixture: any) => 
        fixture.league?.toLowerCase().includes('thai') || 
        fixture.league?.toLowerCase().includes('thailand') ||
        fixture.league?.toLowerCase().includes('ไทย')
      );
    } else {
      // Show specific sport
      allFixtures = liveFeedData.sports[selectedSport] || [];
    }
    
    return allFixtures;
  }, [liveFeedData, selectedSport]);

  // Apply live filter if showLive is enabled
  const displayFixtures = React.useMemo(() => {
    if (!showLive) return fixtures;
    
    // Filter only live matches when showLive is true
    return fixtures.filter((fixture: any) => {
      const isLiveStatus = fixture.status && ['1H', '2H', 'HT', 'LIVE', 'Q1', 'Q2', 'Q3', 'Q4', 'OT', 'ET', 'P', 'H1', 'H2', '1', '2', '3', '4', '5'].includes(fixture.status);
      const isLiveProp = fixture.isLive;
      
      return isLiveStatus || isLiveProp;
    });
  }, [fixtures, showLive]);

  const sportCategories = [
    { 
      id: "all", 
      label: language === 'th' ? "ทั้งหมด" : "All", 
      icon: "🎯" 
    },
    { 
      id: "football", 
      label: language === 'th' ? "ฟุตบอล" : "Football", 
      icon: "⚽" 
    },
    { 
      id: "thai-football", 
      label: language === 'th' ? "ไทยลีก" : "Thai Football", 
      icon: "🇹🇭" 
    },
    { 
      id: "basketball", 
      label: language === 'th' ? "บาสเกตบอล" : "Basketball", 
      icon: "🏀" 
    },
    { 
      id: "hockey", 
      label: language === 'th' ? "ฮอกกี้" : "Hockey", 
      icon: "🏒" 
    },
    { 
      id: "volleyball", 
      label: language === 'th' ? "วอลเลย์บอล" : "Volleyball", 
      icon: "🏐" 
    },
    { 
      id: "baseball", 
      label: language === 'th' ? "เบสบอล" : "Baseball", 
      icon: "⚾" 
    },
  ];

  const handleBetClick = (fixture: any, market: string, odds: string) => {
    const betSelection = {
      fixtureId: fixture.id,
      match: `${fixture.homeTeam} vs ${fixture.awayTeam}`,
      market,
      odds: parseFloat(odds),
      league: fixture.league,
    };
    
    addToBettingSlip(betSelection);
  };

  const handleMatchClick = (fixture: any) => {
    setSelectedMatch(fixture);
    setIsMatchModalOpen(true);
  };

  // Helper functions for favorites
  const isFavorite = (matchId: string) => {
    return favorites.some((fav: any) => fav.matchId === matchId.toString());
  };

  const handleHeartClick = (e: React.MouseEvent, fixture: any) => {
    e.stopPropagation(); // Prevent opening match modal
    
    const matchId = fixture.id.toString();
    if (isFavorite(matchId)) {
      removeFavoriteMutation.mutate(matchId);
    } else {
      addFavoriteMutation.mutate(fixture);
    }
  };

  const handleFavoriteMatchClick = (favoriteMatch: any) => {
    // Convert favorite match to fixture format and open modal
    const fixture = {
      id: favoriteMatch.matchId,
      league: favoriteMatch.league,
      homeTeam: favoriteMatch.homeTeam,
      awayTeam: favoriteMatch.awayTeam,
      status: favoriteMatch.status,
      teams: {
        home: favoriteMatch.homeTeam,
        away: favoriteMatch.awayTeam
      },
      date: favoriteMatch.startTime
    };
    setSelectedMatch(fixture);
    setIsMatchModalOpen(true);
  };

  const getMatchStatus = (fixture: any) => {
    // Check if it's a live match from the new API
    if (fixture.status && ['1H', '2H', 'HT', 'LIVE', 'Q1', 'Q2', 'Q3', 'Q4', 'OT', 'ET', 'P', 'H1', 'H2', '1', '2', '3', '4', '5'].includes(fixture.status)) {
      return <Badge className="bg-red-500 text-white animate-pulse" data-testid={`status-live-${fixture.id}`}>🔴 {fixture.status}</Badge>;
    } else if (fixture.isLive) {
      return <Badge className="bg-red-500 text-white" data-testid={`status-live-${fixture.id}`}>LIVE</Badge>;
    } else if (new Date(fixture.startTime || fixture.startedAt) > new Date()) {
      const time = new Date(fixture.startTime || fixture.startedAt).toLocaleTimeString('th-TH', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
      return <Badge variant="outline" data-testid={`status-time-${fixture.id}`}>{time}</Badge>;
    } else {
      return <Badge variant="outline" data-testid={`status-finished-${fixture.id}`}>{language === 'th' ? 'จบแล้ว' : 'Finished'}</Badge>;
    }
  };

  const renderOddsButtonsMobile = (fixture: any) => {
    if (fixture.sport === 'basketball') {
      return (
        <>
          <Button
            variant="outline"
            className="bg-background hover:bg-primary hover:text-primary-foreground border border-border rounded-md p-2 text-center smooth-transition hover-lift btn-bounce flex-shrink-0 min-w-[100px]"
            onClick={(e) => {
              e.stopPropagation();
              handleBetClick(fixture, 'over', fixture.overOdds || '1.90');
            }}
            data-testid={`bet-over-mobile-${fixture.id}`}
          >
            <div className="text-xs text-muted-foreground">Over {fixture.totalLine || '220.5'}</div>
            <div className="font-semibold">{fixture.overOdds || '1.90'}</div>
          </Button>
          <Button
            variant="outline"
            className="bg-background hover:bg-primary hover:text-primary-foreground border border-border rounded-md p-2 text-center smooth-transition hover-lift btn-bounce flex-shrink-0 min-w-[100px]"
            onClick={(e) => {
              e.stopPropagation();
              handleBetClick(fixture, 'under', fixture.underOdds || '1.95');
            }}
            data-testid={`bet-under-mobile-${fixture.id}`}
          >
            <div className="text-xs text-muted-foreground">Under {fixture.totalLine || '220.5'}</div>
            <div className="font-semibold">{fixture.underOdds || '1.95'}</div>
          </Button>
        </>
      );
    }

    if (fixture.sport === 'hockey') {
      return (
        <>
          <Button
            variant="outline"
            className="bg-background hover:bg-primary hover:text-primary-foreground border border-border rounded-md p-2 text-center smooth-transition hover-lift btn-bounce flex-shrink-0 min-w-[100px]"
            onClick={(e) => {
              e.stopPropagation();
              handleBetClick(fixture, 'over', fixture.overOdds || '2.10');
            }}
            data-testid={`bet-over-mobile-${fixture.id}`}
          >
            <div className="text-xs text-muted-foreground">Over {fixture.totalLine || '5.5'}</div>
            <div className="font-semibold">{fixture.overOdds || '2.10'}</div>
          </Button>
          <Button
            variant="outline"
            className="bg-background hover:bg-primary hover:text-primary-foreground border border-border rounded-md p-2 text-center smooth-transition hover-lift btn-bounce flex-shrink-0 min-w-[100px]"
            onClick={(e) => {
              e.stopPropagation();
              handleBetClick(fixture, 'under', fixture.underOdds || '1.75');
            }}
            data-testid={`bet-under-mobile-${fixture.id}`}
          >
            <div className="text-xs text-muted-foreground">Under {fixture.totalLine || '5.5'}</div>
            <div className="font-semibold">{fixture.underOdds || '1.75'}</div>
          </Button>
        </>
      );
    }

    if (fixture.sport === 'volleyball') {
      return (
        <>
          <Button
            variant="outline"
            className="bg-background hover:bg-primary hover:text-primary-foreground border border-border rounded-md p-2 text-center smooth-transition hover-lift btn-bounce flex-shrink-0 min-w-[100px]"
            onClick={(e) => {
              e.stopPropagation();
              handleBetClick(fixture, 'over', fixture.overOdds || '1.85');
            }}
            data-testid={`bet-over-mobile-${fixture.id}`}
          >
            <div className="text-xs text-muted-foreground">Over {fixture.totalLine || '4.5'} sets</div>
            <div className="font-semibold">{fixture.overOdds || '1.85'}</div>
          </Button>
          <Button
            variant="outline"
            className="bg-background hover:bg-primary hover:text-primary-foreground border border-border rounded-md p-2 text-center smooth-transition hover-lift btn-bounce flex-shrink-0 min-w-[100px]"
            onClick={(e) => {
              e.stopPropagation();
              handleBetClick(fixture, 'under', fixture.underOdds || '1.95');
            }}
            data-testid={`bet-under-mobile-${fixture.id}`}
          >
            <div className="text-xs text-muted-foreground">Under {fixture.totalLine || '4.5'} sets</div>
            <div className="font-semibold">{fixture.underOdds || '1.95'}</div>
          </Button>
        </>
      );
    }

    if (fixture.sport === 'baseball') {
      return (
        <>
          <Button
            variant="outline"
            className="bg-background hover:bg-primary hover:text-primary-foreground border border-border rounded-md p-2 text-center smooth-transition hover-lift btn-bounce flex-shrink-0 min-w-[100px]"
            onClick={(e) => {
              e.stopPropagation();
              handleBetClick(fixture, 'over', fixture.overOdds || '2.20');
            }}
            data-testid={`bet-over-mobile-${fixture.id}`}
          >
            <div className="text-xs text-muted-foreground">Over {fixture.totalLine || '8.5'}</div>
            <div className="font-semibold">{fixture.overOdds || '2.20'}</div>
          </Button>
          <Button
            variant="outline"
            className="bg-background hover:bg-primary hover:text-primary-foreground border border-border rounded-md p-2 text-center smooth-transition hover-lift btn-bounce flex-shrink-0 min-w-[100px]"
            onClick={(e) => {
              e.stopPropagation();
              handleBetClick(fixture, 'under', fixture.underOdds || '1.85');
            }}
            data-testid={`bet-under-mobile-${fixture.id}`}
          >
            <div className="text-xs text-muted-foreground">Under {fixture.totalLine || '8.5'}</div>
            <div className="font-semibold">{fixture.underOdds || '1.85'}</div>
          </Button>
        </>
      );
    }

    // Default 1X2 betting for football and other sports (mobile layout)
    return (
      <>
        <Button
          variant="outline"
          className="bg-background hover:bg-primary hover:text-primary-foreground border border-border rounded-md p-2 text-center smooth-transition hover-lift btn-bounce glow-green flex-shrink-0 min-w-[70px]"
          onClick={(e) => {
            e.stopPropagation();
            handleBetClick(fixture, 'home', fixture.homeOdds || '2.00');
          }}
          disabled={!fixture.homeOdds && !fixture.homeOdds}
          data-testid={`bet-home-mobile-${fixture.id}`}
        >
          <div className="text-xs text-muted-foreground">1</div>
          <div className="font-semibold">{fixture.homeOdds || 'N/A'}</div>
        </Button>
        <Button
          variant="outline"
          className="bg-background hover:bg-primary hover:text-primary-foreground border border-border rounded-md p-2 text-center smooth-transition hover-lift btn-bounce flex-shrink-0 min-w-[70px]"
          onClick={(e) => {
            e.stopPropagation();
            handleBetClick(fixture, 'draw', fixture.drawOdds || '3.00');
          }}
          disabled={!fixture.drawOdds && !fixture.drawOdds}
          data-testid={`bet-draw-mobile-${fixture.id}`}
        >
          <div className="text-xs text-muted-foreground">X</div>
          <div className="font-semibold">{fixture.drawOdds || 'N/A'}</div>
        </Button>
        <Button
          variant="outline"
          className="bg-background hover:bg-primary hover:text-primary-foreground border border-border rounded-md p-2 text-center smooth-transition hover-lift btn-bounce glow-green flex-shrink-0 min-w-[70px]"
          onClick={(e) => {
            e.stopPropagation();
            handleBetClick(fixture, 'away', fixture.awayOdds || '3.50');
          }}
          disabled={!fixture.awayOdds && !fixture.awayOdds}
          data-testid={`bet-away-mobile-${fixture.id}`}
        >
          <div className="text-xs text-muted-foreground">2</div>
          <div className="font-semibold">{fixture.awayOdds || 'N/A'}</div>
        </Button>
      </>
    );
  };

  const renderOddsButtons = (fixture: any) => {
    if (fixture.sport === 'basketball') {
      return (
        <div className="col-span-4 grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            className="bg-background hover:bg-primary hover:text-primary-foreground border border-border rounded-md p-2 text-center smooth-transition hover-lift btn-bounce"
            onClick={(e) => {
              e.stopPropagation();
              handleBetClick(fixture, 'over', fixture.overOdds || '1.90');
            }}
            data-testid={`bet-over-${fixture.id}`}
          >
            <div className="text-xs text-muted-foreground">Over {fixture.totalLine || '220.5'}</div>
            <div className="font-semibold">{fixture.overOdds || '1.90'}</div>
          </Button>
          <Button
            variant="outline"
            className="bg-background hover:bg-primary hover:text-primary-foreground border border-border rounded-md p-2 text-center smooth-transition hover-lift btn-bounce"
            onClick={(e) => {
              e.stopPropagation();
              handleBetClick(fixture, 'under', fixture.underOdds || '1.95');
            }}
            data-testid={`bet-under-${fixture.id}`}
          >
            <div className="text-xs text-muted-foreground">Under {fixture.totalLine || '220.5'}</div>
            <div className="font-semibold">{fixture.underOdds || '1.95'}</div>
          </Button>
        </div>
      );
    }

    if (fixture.sport === 'hockey') {
      return (
        <div className="col-span-4 grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            className="bg-background hover:bg-primary hover:text-primary-foreground border border-border rounded-md p-2 text-center smooth-transition hover-lift btn-bounce"
            onClick={(e) => {
              e.stopPropagation();
              handleBetClick(fixture, 'over', fixture.overOdds || '2.10');
            }}
            data-testid={`bet-over-${fixture.id}`}
          >
            <div className="text-xs text-muted-foreground">Over {fixture.totalLine || '5.5'}</div>
            <div className="font-semibold">{fixture.overOdds || '2.10'}</div>
          </Button>
          <Button
            variant="outline"
            className="bg-background hover:bg-primary hover:text-primary-foreground border border-border rounded-md p-2 text-center smooth-transition hover-lift btn-bounce"
            onClick={(e) => {
              e.stopPropagation();
              handleBetClick(fixture, 'under', fixture.underOdds || '1.75');
            }}
            data-testid={`bet-under-${fixture.id}`}
          >
            <div className="text-xs text-muted-foreground">Under {fixture.totalLine || '5.5'}</div>
            <div className="font-semibold">{fixture.underOdds || '1.75'}</div>
          </Button>
        </div>
      );
    }

    if (fixture.sport === 'volleyball') {
      return (
        <div className="col-span-4 grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            className="bg-background hover:bg-primary hover:text-primary-foreground border border-border rounded-md p-2 text-center smooth-transition hover-lift btn-bounce"
            onClick={(e) => {
              e.stopPropagation();
              handleBetClick(fixture, 'over', fixture.overOdds || '1.85');
            }}
            data-testid={`bet-over-${fixture.id}`}
          >
            <div className="text-xs text-muted-foreground">Over {fixture.totalLine || '4.5'} sets</div>
            <div className="font-semibold">{fixture.overOdds || '1.85'}</div>
          </Button>
          <Button
            variant="outline"
            className="bg-background hover:bg-primary hover:text-primary-foreground border border-border rounded-md p-2 text-center smooth-transition hover-lift btn-bounce"
            onClick={(e) => {
              e.stopPropagation();
              handleBetClick(fixture, 'under', fixture.underOdds || '1.95');
            }}
            data-testid={`bet-under-${fixture.id}`}
          >
            <div className="text-xs text-muted-foreground">Under {fixture.totalLine || '4.5'} sets</div>
            <div className="font-semibold">{fixture.underOdds || '1.95'}</div>
          </Button>
        </div>
      );
    }

    if (fixture.sport === 'baseball') {
      return (
        <div className="col-span-4 grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            className="bg-background hover:bg-primary hover:text-primary-foreground border border-border rounded-md p-2 text-center smooth-transition hover-lift btn-bounce"
            onClick={(e) => {
              e.stopPropagation();
              handleBetClick(fixture, 'over', fixture.overOdds || '2.20');
            }}
            data-testid={`bet-over-${fixture.id}`}
          >
            <div className="text-xs text-muted-foreground">Over {fixture.totalLine || '8.5'}</div>
            <div className="font-semibold">{fixture.overOdds || '2.20'}</div>
          </Button>
          <Button
            variant="outline"
            className="bg-background hover:bg-primary hover:text-primary-foreground border border-border rounded-md p-2 text-center smooth-transition hover-lift btn-bounce"
            onClick={(e) => {
              e.stopPropagation();
              handleBetClick(fixture, 'under', fixture.underOdds || '1.85');
            }}
            data-testid={`bet-under-${fixture.id}`}
          >
            <div className="text-xs text-muted-foreground">Under {fixture.totalLine || '8.5'}</div>
            <div className="font-semibold">{fixture.underOdds || '1.85'}</div>
          </Button>
        </div>
      );
    }

    // Default 1X2 betting for football and other sports
    return (
      <div className="col-span-4 grid grid-cols-3 gap-2">
        <Button
          variant="outline"
          className="bg-background hover:bg-primary hover:text-primary-foreground border border-border rounded-md p-2 text-center smooth-transition hover-lift btn-bounce glow-green"
          onClick={(e) => {
            e.stopPropagation();
            handleBetClick(fixture, 'home', fixture.homeOdds || '2.00');
          }}
          disabled={!fixture.homeOdds && !fixture.homeOdds}
          data-testid={`bet-home-${fixture.id}`}
        >
          <div className="text-xs text-muted-foreground">1</div>
          <div className="font-semibold">{fixture.homeOdds || 'N/A'}</div>
        </Button>
        <Button
          variant="outline"
          className="bg-background hover:bg-primary hover:text-primary-foreground border border-border rounded-md p-2 text-center smooth-transition hover-lift btn-bounce"
          onClick={(e) => {
            e.stopPropagation();
            handleBetClick(fixture, 'draw', fixture.drawOdds || '3.00');
          }}
          disabled={!fixture.drawOdds && !fixture.drawOdds}
          data-testid={`bet-draw-${fixture.id}`}
        >
          <div className="text-xs text-muted-foreground">X</div>
          <div className="font-semibold">{fixture.drawOdds || 'N/A'}</div>
        </Button>
        <Button
          variant="outline"
          className="bg-background hover:bg-primary hover:text-primary-foreground border border-border rounded-md p-2 text-center smooth-transition hover-lift btn-bounce glow-green"
          onClick={(e) => {
            e.stopPropagation();
            handleBetClick(fixture, 'away', fixture.awayOdds || '3.50');
          }}
          disabled={!fixture.awayOdds && !fixture.awayOdds}
          data-testid={`bet-away-${fixture.id}`}
        >
          <div className="text-xs text-muted-foreground">2</div>
          <div className="font-semibold">{fixture.awayOdds || 'N/A'}</div>
        </Button>
      </div>
    );
  };

  return (
    <div className="flex flex-col md:flex-row h-full">
      {/* Mobile: Horizontal Sports Categories Tabs */}
      <div className="md:hidden bg-muted/30 border-b border-border p-3">
        <div className="flex overflow-x-auto scrollbar-hide space-x-2 pb-2">
          {sportCategories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedSport(category.id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-all hover:bg-muted whitespace-nowrap flex-shrink-0 ${
                selectedSport === category.id 
                  ? 'bg-primary text-primary-foreground font-medium' 
                  : 'text-foreground'
              }`}
              data-testid={`sport-mobile-${category.id}`}
            >
              <span className="text-lg">{category.icon}</span>
              <span className="text-sm">{category.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Desktop: Left Sidebar with Sports Categories */}
      <div className="hidden md:block w-48 bg-muted/30 border-r border-border p-3 flex-shrink-0">
        <h3 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wide">
          {language === 'th' ? 'กีฬา' : 'Sports'}
        </h3>
        <div className="space-y-1">
          {sportCategories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedSport(category.id)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-all hover:bg-muted ${
                selectedSport === category.id 
                  ? 'bg-primary text-primary-foreground font-medium' 
                  : 'text-foreground'
              }`}
              data-testid={`sport-${category.id}`}
            >
              <span className="text-lg">{category.icon}</span>
              <span className="text-sm">{category.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 space-y-4 md:space-y-6 p-2 md:p-4">
        {/* Фоновые плавающие эмодзи для матчей */}
        <div className="floating-emojis">
          <div className="floating-emoji">⚽</div>
          <div className="floating-emoji">🏀</div>
          <div className="floating-emoji">🏒</div>
          <div className="floating-emoji">🏐</div>
          <div className="floating-emoji">🏆</div>
          <div className="floating-emoji">🎯</div>
          <div className="floating-emoji">🔥</div>
          <div className="floating-emoji">⚾</div>
        </div>


        {/* Live Section Toggle */}
        <div className="flex items-center justify-between mb-4 relative z-10">
          <h3 className="text-xl font-semibold" data-testid="matches-title">
            {showLive ? (language === 'th' ? "แมตช์สด" : "Live Matches") : (language === 'th' ? "แมตช์วันนี้" : "Today's Matches")}
          </h3>
          <Button
            variant={showLive ? "default" : "outline"}
            className={showLive ? "bg-accent text-accent-foreground" : ""}
            onClick={() => setShowLive(!showLive)}
            data-testid="toggle-live"
          >
            <div className={`w-2 h-2 rounded-full mr-2 ${showLive ? "bg-accent-foreground animate-live-pulse" : "bg-muted-foreground"}`}></div>
            {language === 'th' ? 'สด' : 'LIVE'}
          </Button>
        </div>

        {/* Matches List */}
        <div className="space-y-1 relative z-10">
          {isLoading ? (
            <div className="text-center py-8" data-testid="loading-matches">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-muted-foreground mt-2">{language === 'th' ? 'กำลังโหลดแมตช์...' : 'Loading matches...'}</p>
            </div>
          ) : displayFixtures && displayFixtures.length > 0 ? (
            displayFixtures.map((fixture: any, index: number) => (
              <div key={fixture.id}>
                <div
                  className="bg-muted rounded-lg p-4 card-hover smooth-transition cursor-pointer fade-in"
                  onClick={() => handleMatchClick(fixture)}
                  data-testid={`match-${fixture.id}`}
                >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    {getMatchStatus(fixture)}
                    <span className="text-sm text-muted-foreground" data-testid={`league-${fixture.id}`}>
                      {fixture.league}
                    </span>
                    {(fixture.isLive || (fixture.status && ['1H', '2H', 'HT', 'LIVE', 'Q1', 'Q2', 'Q3', 'Q4', 'OT', 'ET', 'P', 'H1', 'H2', '1', '2', '3', '4', '5'].includes(fixture.status))) && (
                      <span className="text-sm text-accent font-medium" data-testid={`live-time-${fixture.id}`}>
                        {fixture.currentMinute || 0}'
                      </span>
                    )}
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className={`${isFavorite(fixture.id?.toString()) ? 'text-red-500 hover:text-red-600' : 'text-muted-foreground hover:text-secondary'}`}
                    onClick={(e) => handleHeartClick(e, fixture)}
                    data-testid={`favorite-${fixture.id}`}
                  >
                    <Heart className={`h-4 w-4 ${isFavorite(fixture.id?.toString()) ? 'fill-current' : ''}`} />
                  </Button>
                </div>
                
                {/* Mobile Layout */}
                <div className="md:hidden">
                  <div className="space-y-3">
                    {/* Teams and Scores */}
                    <div className="flex justify-between items-center">
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium truncate pr-2" data-testid={`home-team-${fixture.id}`}>
                            {fixture.teams?.home || fixture.homeTeam || 'Home Team'}
                          </span>
                          <span className="text-lg font-bold text-primary" data-testid={`home-score-${fixture.id}`}>
                            {fixture.score?.home ?? fixture.homeScore ?? '-'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium truncate pr-2" data-testid={`away-team-${fixture.id}`}>
                            {fixture.teams?.away || fixture.awayTeam || 'Away Team'}
                          </span>
                          <span className="text-lg font-bold text-primary" data-testid={`away-score-${fixture.id}`}>
                            {fixture.score?.away ?? fixture.awayScore ?? '-'}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Betting Buttons - Horizontal Scroll */}
                    <div className="overflow-x-auto scrollbar-hide">
                      <div className="flex space-x-2 pb-2">
                        {renderOddsButtonsMobile(fixture)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Desktop Layout */}
                <div className="hidden md:block">
                  <div className="grid grid-cols-7 gap-2 items-center">
                    {/* Team Names and Scores */}
                    <div className="col-span-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium" data-testid={`home-team-${fixture.id}`}>
                          {fixture.teams?.home || fixture.homeTeam || 'Home Team'}
                        </span>
                        <span className="text-lg font-bold text-primary" data-testid={`home-score-${fixture.id}`}>
                          {fixture.score?.home ?? fixture.homeScore ?? '-'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium" data-testid={`away-team-${fixture.id}`}>
                          {fixture.teams?.away || fixture.awayTeam || 'Away Team'}
                        </span>
                        <span className="text-lg font-bold text-primary" data-testid={`away-score-${fixture.id}`}>
                          {fixture.score?.away ?? fixture.awayScore ?? '-'}
                        </span>
                      </div>
                    </div>
                    <div className="col-span-2 space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium" data-testid={`home-team-${fixture.id}`}>
                          {fixture.homeTeam}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium" data-testid={`away-team-${fixture.id}`}>
                          {fixture.awayTeam}
                        </span>
                      </div>
                    </div>
                    
                    <div className="col-span-1 text-center">
                      {(fixture.homeScore !== null && fixture.homeScore !== undefined) && (fixture.awayScore !== null && fixture.awayScore !== undefined) ? (
                        <div className="text-lg font-bold" data-testid={`score-${fixture.id}`}>
                          {fixture.homeScore}-{fixture.awayScore}
                        </div>
                      ) : (
                        <div className="text-sm text-muted-foreground" data-testid={`vs-${fixture.id}`}>vs</div>
                      )}
                    </div>
                    
                    {renderOddsButtons(fixture)}
                  </div>
                </div>
                </div>
                
                {/* Декоративные элементы между матчами */}
                {index < displayFixtures.length - 1 && (
                  <div className="relative flex justify-center items-center py-1 overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="flex space-x-3">
                        <span className="text-sm match-separator-emoji" style={{animationDelay: '0s'}}>⚽</span>
                        <span className="text-sm match-separator-emoji" style={{animationDelay: '0.3s'}}>🏀</span>
                        <span className="text-sm match-separator-emoji" style={{animationDelay: '0.6s'}}>🎾</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground" data-testid="no-matches">
              <Clock className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>{language === 'th' ? 'ไม่มีแมตช์ในขณะนี้' : 'No matches available'}</p>
            </div>
          )}
        </div>
      </div>

      {/* Match Modal */}
      <MatchModal 
        open={isMatchModalOpen}
        onOpenChange={setIsMatchModalOpen}
        fixture={selectedMatch}
      />
    </div>
  );
}
