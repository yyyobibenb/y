import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Clock, Trophy, Target } from "lucide-react";
import { useBetting } from "@/hooks/use-betting";
import { getLanguage, t } from "@/lib/i18n";

interface MatchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fixture: any;
}

export default function MatchModal({ open, onOpenChange, fixture }: MatchModalProps) {
  const { addToBettingSlip } = useBetting();
  const language = getLanguage();
  const [selectedBet, setSelectedBet] = useState<{ market: string; odds: number; label: string } | null>(null);
  const [stakeAmount, setStakeAmount] = useState<string>("");

  if (!fixture) return null;

  // Helper function to generate odds for different total lines
  const generateOddsForLine = (line: string, type: 'over' | 'under'): number => {
    const lineNum = parseFloat(line);
    
    // Get current match information for dynamic coefficients
    const currentScore = (fixture.score?.home || fixture.homeScore || 0) + (fixture.score?.away || fixture.awayScore || 0);
    const currentMinute = fixture.currentMinute || 0;
    const isLive = fixture.isLive || fixture.status === 'LIVE';
    
    // Base odds with significantly increased values
    const baseOdds = {
      '0.5': { over: 1.30, under: 8.5 },
      '1.5': { over: 1.45, under: 14.0 },
      '2.5': { over: 1.85, under: 5.5 },
      '3.0': { over: 2.25, under: 3.6 },
      '3.5': { over: 3.15, under: 2.7 },
      '4.0': { over: 4.8, under: 2.1 },
      '4.5': { over: 6.2, under: 1.85 },
      '5.5': { over: 12.5, under: 1.55 },
    };
    
    let odds = baseOdds[line as keyof typeof baseOdds]?.[type] || (type === 'over' ? 2.05 : 2.15);
    
    // Apply time-based multiplier if match is live
    if (isLive && currentMinute > 0) {
      let timeMultiplier = 1.0;
      
      // Increase coefficients as match progresses
      if (currentMinute >= 15 && currentMinute < 30) {
        timeMultiplier = 1.15;
      } else if (currentMinute >= 30 && currentMinute < 45) {
        timeMultiplier = 1.30;
      } else if (currentMinute >= 45 && currentMinute < 60) {
        timeMultiplier = 1.45;
      } else if (currentMinute >= 60 && currentMinute < 75) {
        timeMultiplier = 1.65;
      } else if (currentMinute >= 75) {
        timeMultiplier = 1.85;
      }
      
      odds *= timeMultiplier;
    }
    
    return Math.round(odds * 100) / 100; // Round to 2 decimal places
  };

  // Helper function to generate odds for individual totals
  const generateOddsForIndividual = (line: string, type: 'over' | 'under', team: 'home' | 'away'): number => {
    const lineNum = parseFloat(line);
    const baseOdds = {
      '1.5': { over: 1.63, under: 2.3 },
      '2.5': { over: 2.65, under: 1.48 },
      '3.0': { over: 6.2, under: 1.12 },
    };
    return baseOdds[line as keyof typeof baseOdds]?.[type] || (type === 'over' ? 2.0 : 1.8);
  };

  const handleBetSelect = (market: string, odds: number, label: string) => {
    setSelectedBet({ market, odds, label });
  };

  const handleAddToBet = () => {
    if (!selectedBet || !stakeAmount || parseFloat(stakeAmount) <= 0) return;

    const betSelection = {
      fixtureId: fixture.id,
      match: `${fixture.teams?.home || fixture.homeTeam} vs ${fixture.teams?.away || fixture.awayTeam}`,
      market: selectedBet.market,
      odds: selectedBet.odds,
      league: fixture.league,
      stake: parseFloat(stakeAmount),
    };

    addToBettingSlip(betSelection);
    setSelectedBet(null);
    setStakeAmount("");
    onOpenChange(false);
  };

  const getMatchStatus = () => {
    if (fixture.isLive) {
      return <Badge className="bg-accent text-accent-foreground">LIVE</Badge>;
    } else if (fixture.startTime && new Date(fixture.startTime) > new Date()) {
      const time = new Date(fixture.startTime || fixture.startedAt).toLocaleTimeString(language === 'th' ? 'th-TH' : 'en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
      return <Badge variant="outline">{time}</Badge>;
    } else {
      return <Badge variant="outline">{language === 'th' ? 'จบแล้ว' : 'Finished'}</Badge>;
    }
  };

  const calculatePotentialWin = () => {
    if (!selectedBet || !stakeAmount) return 0;
    return (selectedBet.odds * parseFloat(stakeAmount)).toFixed(2);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto" data-testid="match-modal">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Trophy className="h-5 w-5" />
            <span>{fixture.teams?.home || fixture.homeTeam} vs {fixture.teams?.away || fixture.awayTeam}</span>
          </DialogTitle>
          <DialogDescription className="flex items-center space-x-3">
            <span>{fixture.league}</span>
            {getMatchStatus()}
            {((fixture.score?.home !== null && fixture.score?.home !== undefined && fixture.score?.away !== null && fixture.score?.away !== undefined) || 
              (fixture.homeScore !== null && fixture.homeScore !== undefined && fixture.awayScore !== null && fixture.awayScore !== undefined)) && (
              <span className="text-accent font-medium">
                {fixture.score?.home !== undefined ? fixture.score.home : fixture.homeScore}-{fixture.score?.away !== undefined ? fixture.score.away : fixture.awayScore}
              </span>
            )}
            {(fixture.isLive || fixture.status) && (
              <span className="text-sm text-accent font-medium">
                {fixture.currentMinute || fixture.status || 0}'
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Match Info */}
          <Card>
            <CardContent className="p-4">
              <div className="grid grid-cols-3 items-center text-center">
                <div className="space-y-2">
                  <div className="font-semibold">{fixture.teams?.home || fixture.homeTeam}</div>
                  <div className="text-2xl font-bold">
                    {fixture.score?.home !== null && fixture.score?.home !== undefined ? fixture.score.home : 
                     fixture.homeScore !== null && fixture.homeScore !== undefined ? fixture.homeScore : '-'}
                  </div>
                </div>
                <div className="space-y-2">
                  <Clock className="h-6 w-6 mx-auto text-muted-foreground" />
                  <div className="text-sm text-muted-foreground">
                    {fixture.isLive || fixture.status ? (language === 'th' ? 'กำลังแข่ง' : 'Live') : 
                     fixture.startedAt ? new Date(fixture.startedAt).toLocaleString(language === 'th' ? 'th-TH' : 'en-US') : 
                     fixture.startTime ? new Date(fixture.startTime).toLocaleString(language === 'th' ? 'th-TH' : 'en-US') : 'TBD'}
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="font-semibold">{fixture.teams?.away || fixture.awayTeam}</div>
                  <div className="text-2xl font-bold">
                    {fixture.score?.away !== null && fixture.score?.away !== undefined ? fixture.score.away : 
                     fixture.awayScore !== null && fixture.awayScore !== undefined ? fixture.awayScore : '-'}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Betting Markets */}
          <Tabs defaultValue="match-winner" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="match-winner">
                {language === 'th' ? 'ผลการแข่งขัน' : 'Match Winner'}
              </TabsTrigger>
              <TabsTrigger value="totals">
                {language === 'th' ? 'โททัล' : 'Totals'}
              </TabsTrigger>
              <TabsTrigger value="individual-totals">
                {language === 'th' ? 'โททัลบุคคล' : 'Individual'}
              </TabsTrigger>
              <TabsTrigger value="special">
                {language === 'th' ? 'พิเศษ' : 'Special'}
              </TabsTrigger>
            </TabsList>

            {/* Match Winner Tab */}
            <TabsContent value="match-winner" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">
                    {language === 'th' ? 'เลือกผู้ชนะ' : 'Select Winner'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-3">
                    {(fixture.homeOdds || fixture.odds?.home) && (
                      <Button
                        variant={selectedBet?.market === 'home' ? "default" : "outline"}
                        className="h-auto p-4 flex flex-col space-y-2"
                        onClick={() => handleBetSelect('home', parseFloat(fixture.homeOdds || fixture.odds?.home), fixture.teams?.home || fixture.homeTeam)}
                        data-testid="bet-home-modal"
                      >
                        <div className="text-xs">{fixture.teams?.home || fixture.homeTeam}</div>
                        <div className="font-bold">{fixture.homeOdds || fixture.odds?.home}</div>
                      </Button>
                    )}
                    {(fixture.drawOdds || fixture.odds?.draw) && (
                      <Button
                        variant={selectedBet?.market === 'draw' ? "default" : "outline"}
                        className="h-auto p-4 flex flex-col space-y-2"
                        onClick={() => handleBetSelect('draw', parseFloat(fixture.drawOdds || fixture.odds?.draw), language === 'th' ? 'เสมอ' : 'Draw')}
                        data-testid="bet-draw-modal"
                      >
                        <div className="text-xs">{language === 'th' ? 'เสมอ' : 'Draw'}</div>
                        <div className="font-bold">{fixture.drawOdds || fixture.odds?.draw}</div>
                      </Button>
                    )}
                    {(fixture.awayOdds || fixture.odds?.away) && (
                      <Button
                        variant={selectedBet?.market === 'away' ? "default" : "outline"}
                        className="h-auto p-4 flex flex-col space-y-2"
                        onClick={() => handleBetSelect('away', parseFloat(fixture.awayOdds || fixture.odds?.away), fixture.teams?.away || fixture.awayTeam)}
                        data-testid="bet-away-modal"
                      >
                        <div className="text-xs">{fixture.teams?.away || fixture.awayTeam}</div>
                        <div className="font-bold">{fixture.awayOdds || fixture.odds?.away}</div>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Totals Tab */}
            <TabsContent value="totals" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center space-x-2">
                    <Target className="h-4 w-4" />
                    <span>{language === 'th' ? 'โททัล' : 'TOTAL'}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-2">
                    {/* Multiple total lines like in the Russian site */}
                    {(() => {
                      // Check if there are no goals yet
                      const currentScore = (fixture.score?.home || fixture.homeScore || 0) + (fixture.score?.away || fixture.awayScore || 0);
                      const hasNoGoals = currentScore === 0;
                      
                      // Base lines - always show
                      let totalLines = ['1.5', '2.5', '3.0', '3.5', '4.0', '4.5', '5.5'];
                      
                      // Add 0.5 if there are no goals yet
                      if (hasNoGoals) {
                        totalLines = ['0.5', ...totalLines];
                      }
                      
                      return totalLines;
                    })().map((line) => {
                      const overOdds = generateOddsForLine(line, 'over');
                      const underOdds = generateOddsForLine(line, 'under');
                      return (
                        <div key={line} className="col-span-2 grid grid-cols-2 gap-2 mb-2">
                          <Button
                            variant={selectedBet?.market === `over-${line}` ? "default" : "outline"}
                            className="h-auto p-3 flex flex-col space-y-1"
                            onClick={() => handleBetSelect(`over-${line}`, overOdds, 
                              language === 'th' ? `เกิน ${line}` : `Over ${line}`)}
                            data-testid={`bet-over-${line}-modal`}
                          >
                            <div className="text-xs font-medium">
                              {language === 'th' ? `โททัล (${line}) เกิน` : `Total (${line}) Over`}
                            </div>
                            <div className="font-bold text-lg">{overOdds}</div>
                          </Button>
                          <Button
                            variant={selectedBet?.market === `under-${line}` ? "default" : "outline"}
                            className="h-auto p-3 flex flex-col space-y-1"
                            onClick={() => handleBetSelect(`under-${line}`, underOdds, 
                              language === 'th' ? `ต่ำกว่า ${line}` : `Under ${line}`)}
                            data-testid={`bet-under-${line}-modal`}
                          >
                            <div className="text-xs font-medium">
                              {language === 'th' ? `โททัล (${line}) ต่ำกว่า` : `Total (${line}) Under`}
                            </div>
                            <div className="font-bold text-lg">{underOdds}</div>
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Individual Totals Tab */}
            <TabsContent value="individual-totals" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center space-x-2">
                    <Target className="h-4 w-4" />
                    <span>{language === 'th' ? 'โททัลบุคคล' : 'INDIVIDUAL TOTAL'}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Individual Total for Home Team */}
                    <div>
                      <h4 className="text-sm font-medium mb-2">
                        {language === 'th' ? `โททัลบุคคล - ${fixture.homeTeam}` : `Individual Total - ${fixture.homeTeam}`}
                      </h4>
                      <div className="grid grid-cols-2 gap-2">
                        {['1.5', '2.5', '3.0'].map((line) => {
                          const overOdds = generateOddsForIndividual(line, 'over', 'home');
                          const underOdds = generateOddsForIndividual(line, 'under', 'home');
                          return (
                            <div key={`home-${line}`} className="col-span-2 grid grid-cols-2 gap-2 mb-2">
                              <Button
                                variant={selectedBet?.market === `home-individual-over-${line}` ? "default" : "outline"}
                                className="h-auto p-3 flex flex-col space-y-1"
                                onClick={() => handleBetSelect(`home-individual-over-${line}`, overOdds, 
                                  language === 'th' ? `${fixture.homeTeam} เกิน ${line}` : `${fixture.homeTeam} Over ${line}`)}
                              >
                                <div className="text-xs font-medium">
                                  {language === 'th' ? `โททัล (${line}) เกิน` : `Total (${line}) Over`}
                                </div>
                                <div className="font-bold">{overOdds}</div>
                              </Button>
                              <Button
                                variant={selectedBet?.market === `home-individual-under-${line}` ? "default" : "outline"}
                                className="h-auto p-3 flex flex-col space-y-1"
                                onClick={() => handleBetSelect(`home-individual-under-${line}`, underOdds, 
                                  language === 'th' ? `${fixture.homeTeam} ต่ำกว่า ${line}` : `${fixture.homeTeam} Under ${line}`)}
                              >
                                <div className="text-xs font-medium">
                                  {language === 'th' ? `โททัล (${line}) ต่ำกว่า` : `Total (${line}) Under`}
                                </div>
                                <div className="font-bold">{underOdds}</div>
                              </Button>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <Separator />

                    {/* Individual Total for Away Team */}
                    <div>
                      <h4 className="text-sm font-medium mb-2">
                        {language === 'th' ? `โททัลบุคคล - ${fixture.awayTeam}` : `Individual Total - ${fixture.awayTeam}`}
                      </h4>
                      <div className="grid grid-cols-2 gap-2">
                        {['1.5', '2.5', '3.0'].map((line) => {
                          const overOdds = generateOddsForIndividual(line, 'over', 'away');
                          const underOdds = generateOddsForIndividual(line, 'under', 'away');
                          return (
                            <div key={`away-${line}`} className="col-span-2 grid grid-cols-2 gap-2 mb-2">
                              <Button
                                variant={selectedBet?.market === `away-individual-over-${line}` ? "default" : "outline"}
                                className="h-auto p-3 flex flex-col space-y-1"
                                onClick={() => handleBetSelect(`away-individual-over-${line}`, overOdds, 
                                  language === 'th' ? `${fixture.awayTeam} เกิน ${line}` : `${fixture.awayTeam} Over ${line}`)}
                              >
                                <div className="text-xs font-medium">
                                  {language === 'th' ? `โททัล (${line}) เกิน` : `Total (${line}) Over`}
                                </div>
                                <div className="font-bold">{overOdds}</div>
                              </Button>
                              <Button
                                variant={selectedBet?.market === `away-individual-under-${line}` ? "default" : "outline"}
                                className="h-auto p-3 flex flex-col space-y-1"
                                onClick={() => handleBetSelect(`away-individual-under-${line}`, underOdds, 
                                  language === 'th' ? `${fixture.awayTeam} ต่ำกว่า ${line}` : `${fixture.awayTeam} Under ${line}`)}
                              >
                                <div className="text-xs font-medium">
                                  {language === 'th' ? `โททัล (${line}) ต่ำกว่า` : `Total (${line}) Under`}
                                </div>
                                <div className="font-bold">{underOdds}</div>
                              </Button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Special Bets Tab */}
            <TabsContent value="special" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center space-x-2">
                    <Target className="h-4 w-4" />
                    <span>{language === 'th' ? 'เดิมพันพิเศษ' : 'SPECIAL BETS'}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Both Teams to Score */}
                    <div>
                      <h4 className="text-sm font-medium mb-2">
                        {language === 'th' ? 'ทั้งสองทีมทำประตู' : 'Both Teams to Score'}
                      </h4>
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          variant={selectedBet?.market === 'both-teams-score-yes' ? "default" : "outline"}
                          className="h-auto p-3 flex flex-col space-y-1"
                          onClick={() => handleBetSelect('both-teams-score-yes', 2.35, 
                            language === 'th' ? 'ใช่' : 'Yes')}
                        >
                          <div className="text-xs font-medium">
                            {language === 'th' ? 'ใช่' : 'Yes'}
                          </div>
                          <div className="font-bold">2.35</div>
                        </Button>
                        <Button
                          variant={selectedBet?.market === 'both-teams-score-no' ? "default" : "outline"}
                          className="h-auto p-3 flex flex-col space-y-1"
                          onClick={() => handleBetSelect('both-teams-score-no', 1.48, 
                            language === 'th' ? 'ไม่' : 'No')}
                        >
                          <div className="text-xs font-medium">
                            {language === 'th' ? 'ไม่' : 'No'}
                          </div>
                          <div className="font-bold">1.48</div>
                        </Button>
                      </div>
                    </div>

                    <Separator />

                    {/* Exact Score */}
                    <div>
                      <h4 className="text-sm font-medium mb-2">
                        {language === 'th' ? 'สกอร์ที่แน่นอน' : 'Exact Score'}
                      </h4>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          {score: '1-0', odds: 8.5},
                          {score: '2-0', odds: 12.0},
                          {score: '2-1', odds: 9.5},
                          {score: '0-1', odds: 13.5},
                          {score: '0-2', odds: 25.0},
                          {score: '1-2', odds: 15.0},
                        ].map(({score, odds}) => (
                          <Button
                            key={score}
                            variant={selectedBet?.market === `exact-score-${score}` ? "default" : "outline"}
                            className="h-auto p-2 flex flex-col space-y-1"
                            onClick={() => handleBetSelect(`exact-score-${score}`, odds, score)}
                          >
                            <div className="text-xs font-medium">{score}</div>
                            <div className="font-bold text-sm">{odds}</div>
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Stake Input Section */}
          {selectedBet && (
            <Card className="border-primary/20 bg-primary/5">
              <CardHeader>
                <CardTitle className="text-sm">
                  {language === 'th' ? 'ตั๋วเดิมพัน' : 'Betting Slip'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">{selectedBet.label}</span>
                  <Badge variant="secondary">{selectedBet.odds}</Badge>
                </div>
                <Separator />
                <div className="space-y-2">
                  <Label htmlFor="stake-amount">
                    {language === 'th' ? 'จำนวนเงินเดิมพัน (฿)' : 'Stake Amount (฿)'}
                  </Label>
                  <Input
                    id="stake-amount"
                    type="number"
                    step="0.01"
                    min="1"
                    placeholder="0.00"
                    value={stakeAmount}
                    onChange={(e) => setStakeAmount(e.target.value)}
                    data-testid="input-stake-modal"
                  />
                  {/* Quick Amount Buttons */}
                  <div className="grid grid-cols-4 gap-2">
                    {['100', '500', '1000', '2000'].map((amount) => (
                      <Button
                        key={amount}
                        size="sm"
                        variant="outline"
                        className="text-xs h-8"
                        onClick={() => setStakeAmount(amount)}
                        data-testid={`quick-amount-${amount}-modal`}
                      >
                        {amount}
                      </Button>
                    ))}
                  </div>
                </div>
                {stakeAmount && parseFloat(stakeAmount) > 0 && (
                  <div className="bg-background border border-border rounded-lg p-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">
                        {language === 'th' ? 'กำไรที่เป็นไปได้:' : 'Potential Win:'}
                      </span>
                      <span className="font-bold text-primary">
                        ฿{calculatePotentialWin()}
                      </span>
                    </div>
                  </div>
                )}
                <Button
                  className="w-full betting-gradient"
                  onClick={handleAddToBet}
                  disabled={!stakeAmount || parseFloat(stakeAmount) <= 0}
                  data-testid="button-add-to-bet"
                >
                  {language === 'th' ? 'เพิ่มเข้าตั๋วเดิมพัน' : 'Add to Betting Slip'}
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}