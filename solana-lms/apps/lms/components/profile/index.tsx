import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import {
  CredentialCard,
  SkillProgress,
} from "@workspace/ui/components/custom-card";
import {
  Github,
  Twitter,
  ExternalLink,
  Box,
  Code,
  Shield,
  Layout as LayoutIcon,
} from "lucide-react";

export default function Profile() {
  const achievements = [
    { name: "First Steps", icon: "🚀", date: "Jan 12, 2024" },
    { name: "Code Warrior", icon: "⚔️", date: "Jan 20, 2024" },
    { name: "Solana Scout", icon: "💎", date: "Feb 01, 2024" },
  ];

  return (
    <div className="container max-w-5xl mx-auto px-4 py-12">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Column - User Info */}
        <div className="lg:w-1/3 space-y-6">
          <Card className="border-white/10 bg-white/5 backdrop-blur-sm overflow-hidden">
            <div className="h-32 bg-linear-to-r from-primary/20 to-secondary/20" />
            <CardContent className="relative px-6 pb-6">
              <div className="absolute -top-12 left-6">
                <Avatar className="w-24 h-24 border-4 border-background ring-2 ring-primary/20">
                  <AvatarImage src="https://github.com/shadcn.png" />
                  <AvatarFallback>DV</AvatarFallback>
                </Avatar>
              </div>
              <div className="mt-14 space-y-4">
                <div>
                  <h2 className="text-2xl font-heading font-bold">
                    SolanaDev_2024
                  </h2>
                  <p className="text-muted-foreground">
                    Full-stack developer building on Solana. Passionate about
                    DeFi and high-performance rust.
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="hover:text-primary"
                  >
                    <Github className="w-4 h-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="hover:text-primary"
                  >
                    <Twitter className="w-4 h-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="hover:text-primary"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </div>

                <div className="pt-4 border-t border-white/5 grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-xl font-bold font-heading">1,240</div>
                    <div className="text-xs text-muted-foreground uppercase tracking-widest">
                      Total XP
                    </div>
                  </div>
                  <div>
                    <div className="text-xl font-bold font-heading">
                      Level 12
                    </div>
                    <div className="text-xs text-muted-foreground uppercase tracking-widest">
                      Rank
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Activity & Credentials */}
        <div className="flex-1 space-y-6">
          <Card className="border-white/10 bg-white/5">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-xl font-heading font-bold">
                On-Chain Credentials
              </CardTitle>
              <Badge
                variant="outline"
                className="border-primary/20 bg-primary/5 text-primary"
              >
                3 NFT Badges
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <CredentialCard
                  title="Solana Fundamentals"
                  id="CNFT...9X21"
                  date="Feb 2024"
                  color="from-primary to-blue-500"
                />
                <CredentialCard
                  title="DeFi Master"
                  id="CNFT...Y881"
                  date="Mar 2024"
                  color="from-secondary to-purple-500"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-white/5">
            <CardHeader>
              <CardTitle className="text-xl font-heading font-bold">
                Achievement Showcase
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {achievements.map((ach) => (
                  <div
                    key={ach.name}
                    className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/5 group hover:border-primary/30 transition-colors"
                  >
                    <div className="text-2xl">{ach.icon}</div>
                    <div>
                      <div className="text-sm font-bold group-hover:text-primary transition-colors">
                        {ach.name}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {ach.date}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
