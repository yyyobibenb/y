import { useState, useEffect } from "react";
import { useLocation, useSearch } from "wouter";
import Header from "@/components/Header";
import SportsGrid from "@/components/SportsGrid";
import BettingSlip from "@/components/BettingSlip";
import LiveUpdates from "@/components/LiveUpdates";
import BettingHistory from "@/components/BettingHistory";
import BonusBanner from "@/components/BonusBanner";
import Footer from "@/components/Footer";
import DashboardPage from "@/pages/dashboard-page";
import BottomNavigation from "@/components/BottomNavigation";
import SupportChatWidget from "@/components/SupportChatWidget";
import FavoritesMenu from "@/components/FavoritesMenu";
import MatchModal from "@/components/MatchModal";
import { getLanguage } from "@/lib/i18n";
import { useQuery } from "@tanstack/react-query";

export default function HomePage() {
  const [activeSection, setActiveSection] = useState<'dashboard' | 'betting' | 'history'>('betting');
  const [location] = useLocation();
  const search = useSearch();
  const language = getLanguage();
  const [selectedMatch, setSelectedMatch] = useState<any>(null);
  const [isMatchModalOpen, setIsMatchModalOpen] = useState<boolean>(false);

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

  const handleMobileNavigate = (section: 'dashboard' | 'betting' | 'history') => {
    setActiveSection(section);
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
  
  // Extract section parameter from URL
  const urlParams = new URLSearchParams(search);
  const sectionParam = urlParams.get('section');

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return <DashboardPage />;
      case 'history':
        return <BettingHistory />;
      case 'betting':
      default:
        return (
          <div className="flex flex-col md:flex-row gap-4 h-full">
            <div className="flex-1 space-y-3">
              {/* Bonus Banner */}
              <BonusBanner />
              <SportsGrid urlSection={sectionParam} />
              
              {/* Mobile BettingSlip - shown at bottom on mobile */}
              <div className="md:hidden mt-4">
                <BettingSlip />
              </div>
            </div>

            {/* Right sidebar - hidden on mobile */}
            <div className="hidden md:block w-80 space-y-4">
              <BettingSlip />
              
              {/* Right Advertisement */}
              <div className="sticky top-6 space-y-4">
                <div className="bg-muted/50 border border-border rounded-lg p-4 min-h-[300px] flex flex-col items-center justify-center" data-testid="right-advertisement">
                  <div className="text-center space-y-2">
                    <div className="text-2xl opacity-50">📢</div>
                    <p className="text-xs text-muted-foreground">{language === 'th' ? 'โฆษณา' : 'Advertisement'}</p>
                    <p className="text-xs text-muted-foreground">{language === 'th' ? 'สำหรับ GIF' : 'For GIF'}</p>
                  </div>
                </div>
                
                {/* Favorites Menu */}
                <FavoritesMenu 
                  favorites={favorites} 
                  onMatchClick={handleFavoriteMatchClick}
                />
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background emoji-background flex flex-col">
      {/* Фоновые плавающие эмодзи */}
      <div className="floating-emojis">
        <div className="floating-emoji">⚽</div>
        <div className="floating-emoji">🏀</div>
        <div className="floating-emoji">🎾</div>
        <div className="floating-emoji">💰</div>
        <div className="floating-emoji">🏆</div>
        <div className="floating-emoji">🎯</div>
        <div className="floating-emoji">🎲</div>
        <div className="floating-emoji">💎</div>
        <div className="floating-emoji">🔥</div>
        <div className="floating-emoji">⭐</div>
        <div className="floating-emoji">🚀</div>
        <div className="floating-emoji">💸</div>
      </div>
      
      <Header />
      <main className="container mx-auto px-4 py-6 relative z-10">
        <div className="fade-in">
          {renderContent()}
        </div>
      </main>
      <LiveUpdates />
      <Footer />
      
      {/* Mobile Bottom Navigation - только для мобильных устройств */}
      <div className="md:hidden">
        <BottomNavigation 
          onNavigate={handleMobileNavigate}
          activeSection={activeSection}
        />
      </div>

      {/* Support Chat Widget */}
      <SupportChatWidget />
      
      {/* Match Modal */}
      <MatchModal 
        match={selectedMatch} 
        isOpen={isMatchModalOpen} 
        onClose={() => setIsMatchModalOpen(false)} 
      />
    </div>
  );
}
