"use client";
import {
  ArrowLeft,
  CheckCircle,
  Play,
  Trophy,
  Terminal,
  Code,
  ChevronLeft,
  ChevronRight,
  Lightbulb,
  BookOpen,
  ExternalLink,
  Eye,
  EyeOff,
  XCircle,
  FileText,
  Video,
} from "lucide-react";
import {useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@workspace/ui/components/button";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@workspace/ui/components/resizable";
import { Progress } from "@workspace/ui/components/progress";
import { ScrollArea } from "@workspace/ui/components/scroll-area";
import { cn } from "@workspace/ui/lib/utils";
import { PortableTextRenderer } from "../markdown";
import { MonacoEditor } from "../monaco-editor";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { courseQueries, lessonQueries, progressQueries } from "@/lib/queries";
import { Lesson, Module } from "@workspace/sanity-client";
import { useCourse } from "@/hooks/use-course";
import { getCurrentUserId } from "@/hooks/auth";

/* =====================================================
   TYPES
===================================================== */

interface FlatLesson {
  id: string;
  slug: string;
  title: string;
  xpReward: number;
}

interface FlatLessonsResult {
  lessons: FlatLesson[];
  totalLessons: number;
  totalXp: number;
}

interface LessonNavigation {
  currentId: string;
  prev: FlatLesson | null;
  next: FlatLesson | null;
  isCurrentCompleted: boolean;
}

/* =====================================================
   HELPERS
===================================================== */

function flattenLessons(
  modules: Array<Omit<Module, "lessons"> & { lessons: Lesson[] }>,
): FlatLessonsResult {
  const lessons = (modules ?? []).flatMap((mod) =>
    (mod.lessons ?? []).map((lesson) => ({
      id: lesson._id,
      slug: lesson.slug?.current as string,
      title: lesson.title as string,
      xpReward: lesson.xpReward ?? 0,
    })),
  );

  return {
    lessons,
    totalLessons: lessons.length,
    totalXp: lessons.reduce((sum, l) => sum + l.xpReward, 0),
  };
}

/* =====================================================
   ROOT PAGE
===================================================== */

export default function Course() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const courseSlug = params.courseId as string;
  const lessonSlug = params.courseLessonId?.[0] as string;
  const language = searchParams.get("lang") as string;
  const {userId} = getCurrentUserId();
  const [showCodeEditor, setShowCodeEditor] = useState(false);
  const { completeLesson } = useCourse(courseSlug);

  const { data: course } = useQuery(courseQueries.bySlug(courseSlug, language));
  const { data: progress } = useQuery(
    progressQueries.course(userId, course?._id as string),
  );
  const { data: lesson } = useQuery(lessonQueries.bySlug(lessonSlug, language));

  const modules = course?.modules as unknown as Array<
    Omit<Module, "lessons"> & { lessons: Lesson[] }
  >;

  const { lessons: allLessons, totalLessons } = flattenLessons(modules ?? []);
  const currentLesson = allLessons.find((l) => l.slug === lessonSlug);
  const currentIndex = currentLesson ? allLessons.indexOf(currentLesson) : -1;

  const completedLessons: string[] = progress?.completedLessons ?? [];
  const completionPercentage = progress?.completionPercentage ?? 0;

  const hasCodeChallenge = !!(
    lesson?.starterCode?.code || lesson?.testCases?.length
  );

  const nav: any = {
    currentId: currentLesson?.id ?? "",
    prev: currentIndex > 0 ? allLessons[currentIndex - 1] : null,
    next:
      currentIndex !== -1 && currentIndex < allLessons.length - 1
        ? allLessons[currentIndex + 1]
        : null,
    isCurrentCompleted: currentLesson
      ? completedLessons.includes(currentLesson.id)
      : false,
  };

  const handleNext = () => {
    if (!nav.isCurrentCompleted && currentLesson) {
      completeLesson.mutate(
        {
          lessonId: currentLesson.id,
          totalLessons,
          xpReward: currentLesson.xpReward,
        },
        {
          onSuccess() {
            if (nav.next) {
              router.push(nav.next.slug);
            }
          },
        },
      );
    } else if (nav.next) {
      router.push(nav.next.slug);
    }
  };

  return (
    <div className="text-foreground bg-background h-[calc(100vh-5rem)] flex flex-col">
      <Header
        lessonSlug={lessonSlug}
        hasCodeChallenge={hasCodeChallenge}
        showCodeEditor={showCodeEditor}
        onToggleEditor={() => setShowCodeEditor((v) => !v)}
      />

      <ResizablePanelGroup orientation="horizontal" className="h-full">
        <Sidebar
          courseSlug={courseSlug}
          lessonSlug={lessonSlug}
          language={language}
          allLessons={allLessons}
          completedLessons={completedLessons}
          completionPercentage={completionPercentage}
        />

        <ResizableHandle />

        <LessonPanel
          lessonSlug={lessonSlug}
          language={language}
          showCodeEditor={showCodeEditor}
          nav={nav}
          onNext={handleNext}
        />

        {(showCodeEditor || !hasCodeChallenge) && (
          <>
            <ResizableHandle className="bg-white/5 hover:bg-primary/50 transition-colors w-1" />
            <EditorPanel lessonSlug={lessonSlug} language={language} />
          </>
        )}
      </ResizablePanelGroup>
    </div>
  );
}

/* =====================================================
   HEADER
===================================================== */

function Header({
  lessonSlug,
  hasCodeChallenge,
  showCodeEditor,
  onToggleEditor,
}: {
  lessonSlug: string;
  hasCodeChallenge: boolean;
  showCodeEditor: boolean;
  onToggleEditor: () => void;
}) {
  return (
    <header className="h-14 border-b border-white/5 bg-black/50 backdrop-blur flex items-center justify-between px-4 shrink-0">
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => window.history.back()}
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <h1 className="text-sm font-bold leading-tight capitalize truncate">
          {lessonSlug?.replaceAll("-", " ")}
        </h1>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden md:flex items-center gap-2 text-xs bg-white/5 px-3 py-1.5 rounded-md border border-white/5">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          Devnet Active
        </div>

        {/* Only show toggle when there's a code challenge — otherwise editor is always visible */}
        {hasCodeChallenge && (
          <Button
            variant="ghost"
            size="sm"
            className={cn("h-8 gap-2", showCodeEditor && "bg-white/10")}
            onClick={onToggleEditor}
          >
            <Code className="w-4 h-4" />
            <span className="hidden sm:inline">
              {showCodeEditor ? "Hide" : "Show"} Editor
            </span>
          </Button>
        )}
      </div>
    </header>
  );
}

/* =====================================================
   SIDEBAR  (course progress + lesson list)
===================================================== */

function Sidebar({
  courseSlug,
  lessonSlug,
  language,
  allLessons,
  completedLessons,
  completionPercentage,
}: {
  courseSlug: string;
  lessonSlug: string;
  language: string;
  allLessons: FlatLesson[];
  completedLessons: string[];
  completionPercentage: number;
}) {
  const { data: course } = useQuery(courseQueries.bySlug(courseSlug, language));
  const modules = course?.modules as unknown as Array<
    Omit<Module, "lessons"> & { lessons: Lesson[] }
  >;

  return (
    // <ResizablePanel
    //   id="left"
    //   collapsible
    //   defaultSize="20%"
    //   maxSize="20%"
    //   className="bg-black/20 min-w-5 border-border/50"
    // >
    <div className="h-full max-w-[18rem] hidden lg:flex flex-col">
      <div className="p-4 border-b border-border/50">
        <p className="font-medium text-muted-foreground tracking-tight text-xs mb-1">
          Course progress
        </p>
        <Progress value={completionPercentage} className="h-1 bg-white/10" />
        <p className="text-xs tracking-tight text-muted-foreground mt-1">
          {completionPercentage}% Complete
        </p>
      </div>

      <ScrollArea className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-4">
          {modules?.map((mod) => (
            <div key={mod._id} className="space-y-2">
              <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider pl-2">
                {mod.title}
              </div>
              <div className="space-y-0.5">
                {mod?.lessons?.map((lesson) => {
                  const slug = lesson.slug?.current as string;
                  const flat = allLessons.find((l) => l.id === lesson._id);
                  return (
                    <LessonNavItem
                      key={lesson._id}
                      title={lesson.title as string}
                      lessonSlug={slug}
                      activeLessonSlug={lessonSlug}
                      completed={
                        flat ? completedLessons.includes(flat.id) : false
                      }
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
    // </ResizablePanel>
  );
}

/* =====================================================
   LESSON PANEL  (content + video tabs, shared extras)
===================================================== */

function LessonPanel({
  lessonSlug,
  language,
  showCodeEditor,
  nav,
  onNext,
}: {
  lessonSlug: string;
  language: string;
  showCodeEditor: boolean;
  nav: LessonNavigation;
  onNext: () => void;
}) {
  const { data: lesson } = useQuery(lessonQueries.bySlug(lessonSlug, language));
  const hasVideo = !!(lesson?.hasVideo && lesson.videoUrl);
  const [activeTab, setActiveTab] = useState<"content" | "video">("content");

  // Shared extras shown in both tabs
  const extras = (
    <>
      {lesson?.challengePrompt && (
        <ChallengeBlock prompt={lesson.challengePrompt} />
      )}
      {!!lesson?.hints?.length && <HintsBlock hints={lesson.hints} />}
      {!!lesson?.resources?.length && (
        <ResourcesBlock resources={lesson.resources as any} />
      )}
    </>
  );

  return (
    <ResizablePanel
      id="center"
      defaultSize="100%"
      maxSize="100%"
      className="flex  flex-col h-full"
    >
      {hasVideo && (
        <div className="flex items-center gap-1 px-4 border-b border-white/5 shrink-0">
          <TabButton
            active={activeTab === "content"}
            onClick={() => setActiveTab("content")}
            icon={<FileText className="w-3.5 h-3.5" />}
            label="Content"
          />
          <TabButton
            active={activeTab === "video"}
            onClick={() => setActiveTab("video")}
            icon={<Video className="w-3.5 h-3.5" />}
            label="Video"
          />
        </div>
      )}

      <ScrollArea className="flex-1 overflow-y-auto">
        <div className="py-6 px-6 max-w-3xl pb-20 mx-auto space-y-8">
          {activeTab === "video" && hasVideo ? (
            <>
              <VideoPlayer
                videoUrl={lesson!.videoUrl!}
                videoProvider={lesson?.videoProvider}
                videoThumbnail={lesson?.videoThumbnail as unknown as string}
                title={lesson?.title ?? ""}
              />
              {extras}
            </>
          ) : (
            <>
              {lesson?.hasTextContent && lesson.content && (
                <PortableTextRenderer content={lesson.content as any} />
              )}
              {extras}
            </>
          )}
        </div>
      </ScrollArea>

      <LessonFooter nav={nav} onNext={onNext} xpReward={lesson?.xpReward} />
    </ResizablePanel>
  );
}

/* =====================================================
   VIDEO PLAYER
===================================================== */

function VideoPlayer({
  videoUrl,
  videoProvider,
  videoThumbnail,
  title,
}: {
  videoUrl: string;
  videoProvider?: string | null;
  videoThumbnail?: string | null;
  title: string;
}) {
  const [playing, setPlaying] = useState(false);

  const getEmbedUrl = (): string | null => {
    if (videoProvider === "youtube") {
      const id = videoUrl.match(
        /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/,
      )?.[1];
      return id ? `https://www.youtube.com/embed/${id}?autoplay=1` : null;
    }
    if (videoProvider === "vimeo") {
      const id = videoUrl.match(/vimeo\.com\/(\d+)/)?.[1];
      return id ? `https://player.vimeo.com/video/${id}?autoplay=1` : null;
    }
    return videoUrl;
  };

  const embedUrl = getEmbedUrl();

  return (
    <div className="rounded-xl overflow-hidden border border-white/10 bg-black aspect-video relative">
      {playing && embedUrl ? (
        <iframe
          src={embedUrl}
          className="w-full h-full"
          allow="autoplay; fullscreen"
          allowFullScreen
        />
      ) : (
        <div
          onClick={() => setPlaying(true)}
          className="w-full h-full flex items-center justify-center group relative"
        >
          {videoThumbnail && (
            <img
              src={videoThumbnail}
              alt={title}
              className="absolute inset-0 w-full h-full object-cover opacity-60"
            />
          )}
          <Button
            size="icon-lg"
            variant="secondary"
            className="relative w-14 h-14 z-10 flex items-center justify-center transition-transform"
          >
            <Play className="size-6" />
          </Button>
        </div>
      )}
    </div>
  );
}

/* =====================================================
   CHALLENGE / HINTS / RESOURCES  (shared extras)
===================================================== */

function ChallengeBlock({ prompt }: { prompt: string }) {
  return (
    <div className="rounded-lg border border-white/10 overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-white/10 bg-white/3">
        <Trophy className="w-3.5 h-3.5 text-yellow-400" />
        <span className="text-xs font-semibold text-yellow-400 uppercase tracking-wider">
          Challenge
        </span>
      </div>
      <p className="px-4 py-3 text-sm text-muted-foreground leading-relaxed">
        {prompt}
      </p>
    </div>
  );
}

function HintsBlock({ hints }: { hints: string[] }) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="rounded-lg border border-white/10 overflow-hidden">
      <button
        onClick={() => setVisible((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-2.5 bg-white/3 hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Lightbulb className="w-3.5 h-3.5 text-blue-400" />
          <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider">
            Hints
          </span>
          <span className="text-xs text-muted-foreground/50">
            {hints.length}
          </span>
        </div>
        <ChevronRight
          className={cn(
            "w-3.5 h-3.5 text-muted-foreground/40 transition-transform duration-200",
            visible && "rotate-90",
          )}
        />
      </button>

      {visible && (
        <div className="divide-y divide-white/5">
          {hints.map((hint, i) => (
            <div key={i} className="flex gap-3 px-4 py-3">
              <span className="text-[10px] font-mono text-white/20 mt-0.5 shrink-0">
                {String(i + 1).padStart(2, "0")}
              </span>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {hint}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ResourcesBlock({
  resources,
}: {
  resources: Array<{ _key: string; title: string; type: string; url: string }>;
}) {
  return (
    <div className="rounded-lg border border-white/10 overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-white/10 bg-white/[0.03]">
        <BookOpen className="w-3.5 h-3.5 text-muted-foreground" />
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Resources
        </span>
      </div>
      <div className="divide-y divide-white/5">
        {resources.map((r) => (
          <a
            key={r._key}
            href={r.url.trim()}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between px-4 py-3 hover:bg-white/3 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-white/20 shrink-0" />
              <div>
                <p className="text-xs font-medium text-foreground/80 group-hover:text-foreground transition-colors">
                  {r.title}
                </p>
                <p className="text-[10px] text-muted-foreground/50 capitalize mt-0.5">
                  {r.type}
                </p>
              </div>
            </div>
            <ExternalLink className="w-3.5 h-3.5 text-muted-foreground/30 group-hover:text-muted-foreground transition-colors shrink-0" />
          </a>
        ))}
      </div>
    </div>
  );
}

/* =====================================================
   LESSON FOOTER
===================================================== */

function LessonFooter({
  nav,
  onNext,
  xpReward,
}: {
  nav: LessonNavigation;
  onNext: () => void;
  xpReward?: number | null;
}) {
  const { prev, next, isCurrentCompleted } = nav;

  return (
    <div className="flex p-3 border-t border-border/40 justify-between items-center bg-background">
      {prev ? (
        <Link href={prev.slug}>
          <Button variant="outline" className="gap-1.5 text-muted-foreground">
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Previous</span>
          </Button>
        </Link>
      ) : (
        <Button
          variant="outline"
          disabled
          className="gap-1.5 text-muted-foreground"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Previous</span>
        </Button>
      )}

      {next ? (
        <Button
          onClick={onNext}
          variant="outline"
          className="gap-1.5 text-accent-foreground/60"
        >
          {isCurrentCompleted ? (
            <>
              Next Lesson
              <ChevronRight className="w-4 h-4" />
            </>
          ) : (
            <>
              <CheckCircle className="w-4 h-4" />
              Complete
              {xpReward && (
                <span className="text-xs text-yellow-400 font-normal">
                  +{xpReward} XP
                </span>
              )}
            </>
          )}
        </Button>
      ) : (
        !isCurrentCompleted && (
          <Button
            variant="outline"
            onClick={onNext}
            className="gap-1.5 text-accent-foreground/60"
          >
            <CheckCircle className="w-4 h-4" />
            Complete Lesson
            {xpReward && (
              <span className="text-xs text-yellow-400 font-normal">
                +{xpReward} XP
              </span>
            )}
          </Button>
        )
      )}
    </div>
  );
}

/* =====================================================
   EDITOR PANEL
===================================================== */

function EditorPanel({
  lessonSlug,
  language,
}: {
  lessonSlug: string;
  language: string;
}) {
  const { data: lesson } = useQuery(lessonQueries.bySlug(lessonSlug, language));

  const [code, setCode] = useState(lesson?.starterCode?.code ?? "");
  const [showSolution, setShowSolution] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [consoleOutput, setConsoleOutput] = useState<string[]>([]);
  const [testResults, setTestResults] = useState<
    Array<{ name: string; passed: boolean; expected: string; got: string }>
  >([]);
  const [activeTab, setActiveTab] = useState<"terminal" | "tests">("terminal");

  const visibleTestCases =
    lesson?.testCases?.filter((tc) => !tc.isHidden) ?? [];

  const runCode = () => {
    setIsRunning(true);
    setConsoleOutput([]);
    setTestResults([]);
    setActiveTab("terminal");

    setTimeout(
      () => setConsoleOutput((p) => [...p, "> Compiling program..."]),
      500,
    );
    setTimeout(
      () => setConsoleOutput((p) => [...p, "> Deploying to Devnet..."]),
      1500,
    );
    setTimeout(() => {
      setConsoleOutput((p) => [
        ...p,
        "> Program deployed: Fg6P...LnS",
        "> Transaction signature: 5Kj3...9zX",
        "> Logs:",
        "  Program log: Hello Solana!",
        "  Program consumed: 1240 compute units",
      ]);

      if (visibleTestCases.length) {
        const results = visibleTestCases.map((tc) => ({
          name: tc.name,
          passed: code.trim() === tc?.expectedOutput?.trim(),
          expected: tc.expectedOutput,
          got: code.trim(),
        }));
        setTestResults(results as any);
        setActiveTab("tests");

        const allPassed = results.every((r) => r.passed);
        toast(allPassed ? "All tests passed! 🎉" : "Some tests failed", {
          description: allPassed
            ? "Great work — your solution is correct"
            : `${results.filter((r) => r.passed).length}/${results.length} tests passing`,
        });
      } else {
        toast("Run complete!", {
          description: "Program deployed and executed successfully",
        });
      }

      setIsRunning(false);
    }, 2500);
  };

  const toggleSolution = () => {
    if (!showSolution && lesson?.solution) {
      setCode(lesson.solution.code as any);
      setShowSolution(true);
    } else if (lesson?.starterCode) {
      setCode(lesson.starterCode.code as any);
      setShowSolution(false);
    }
  };

  return (
    <ResizablePanel
      id="right"
      defaultSize={350}
      minSize={300}
      className="flex flex-col"
    >
      <ResizablePanelGroup orientation="vertical">
        {/* Code editor */}
        <ResizablePanel collapsible minSize={30}>
          <div className="h-full flex flex-col bg-muted">
            <div className="border-b border-border flex items-center justify-between px-4 bg-background">
              <div className="px-3 h-10 flex items-center justify-center border-b border-primary text-muted-foreground text-sm tracking-tight">
                {lesson?.starterCode?.filename ?? "main.rs"}
              </div>
              {lesson?.solution && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 gap-1.5 text-xs text-muted-foreground"
                  onClick={toggleSolution}
                >
                  {showSolution ? (
                    <>
                      <EyeOff className="w-3 h-3" /> Hide solution
                    </>
                  ) : (
                    <>
                      <Eye className="w-3 h-3" /> Show solution
                    </>
                  )}
                </Button>
              )}
            </div>
            <div className="flex-1 pt-2 bg-background">
              <MonacoEditor value={code} onChange={setCode} />
            </div>
          </div>
        </ResizablePanel>

        <ResizableHandle className="h-1" />

        {/* Terminal / Tests */}
        <ResizablePanel defaultSize={100} minSize={100} maxSize={300}>
          <div className="h-full flex flex-col bg-background">
            <div className="flex border-b border-border shrink-0">
              <button
                onClick={() => setActiveTab("terminal")}
                className={cn(
                  "flex flex-1 items-center justify-center gap-1.5 h-10 text-xs font-semibold transition-colors border-r border-border",
                  activeTab === "terminal"
                    ? "bg-background text-foreground border-b-2 border-b-primary"
                    : "bg-muted/30 text-muted-foreground/40 hover:text-muted-foreground",
                )}
              >
                <Terminal className="w-3 h-3" />
                Terminal
              </button>

              {visibleTestCases.length > 0 ? (
                <button
                  onClick={() => setActiveTab("tests")}
                  className={cn(
                    "flex flex-1 items-center justify-center gap-1.5 h-10 text-xs font-semibold transition-colors",
                    activeTab === "tests"
                      ? "bg-background text-foreground border-b-2 border-b-primary"
                      : "bg-muted/30 text-muted-foreground/40 hover:text-muted-foreground",
                  )}
                >
                  <CheckCircle className="w-3 h-3" />
                  Tests
                  {testResults.length > 0 && (
                    <span
                      className={cn(
                        "px-1.5 py-0.5 rounded-full text-xs",
                        testResults.every((r) => r.passed)
                          ? "bg-green-500/20 text-green-400"
                          : "bg-red-500/20 text-red-400",
                      )}
                    >
                      {testResults.filter((r) => r.passed).length}/
                      {testResults.length}
                    </span>
                  )}
                </button>
              ) : (
                /* Keep Run button right-aligned when no tests tab */
                <div className="flex flex-1 items-center justify-center px-3">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 gap-1 text-muted-foreground hover:bg-primary/90 font-bold text-xs"
                    onClick={runCode}
                    disabled={isRunning}
                  >
                    {isRunning ? "Running..." : "Run"}
                    <Play className="w-2.5 h-2.5 fill-current" />
                  </Button>
                </div>
              )}

              {/* Run button always visible when tests tab exists */}
              {visibleTestCases.length > 0 && (
                <div className="flex items-center px-3 border-l border-border">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 gap-1 text-muted-foreground hover:bg-primary/90 font-bold text-xs"
                    onClick={runCode}
                    disabled={isRunning}
                  >
                    {isRunning ? "Running..." : "Run"}
                    <Play className="w-2.5 h-2.5 fill-current" />
                  </Button>
                </div>
              )}
            </div>

            {activeTab === "terminal" && (
              <ScrollArea className="flex-1 overflow-y-auto">
                <div className="p-3 font-mono text-xs space-y-0.5">
                  {/* Boot line */}
                  <div className="flex items-center gap-2 text-muted-foreground/40 pb-2 mb-2 border-b border-white/5">
                    <span className="text-green-500/60">●</span>
                    <span>solana-cli 1.18.0 · devnet</span>
                  </div>

                  {consoleOutput.length === 0 && !isRunning && (
                    <div className="text-muted-foreground/30 italic">
                      Press Run to execute your program...
                    </div>
                  )}

                  {consoleOutput.map((line, i) => {
                    if (line.startsWith("> ")) {
                      return (
                        <div key={i} className="flex items-start gap-2 py-0.5">
                          <span className="text-muted-foreground/40 shrink-0">
                            $
                          </span>
                          <span className="text-foreground/80">
                            {line.slice(2)}
                          </span>
                        </div>
                      );
                    }
                    const text = line.trim();
                    const isError = text.toLowerCase().includes("error");
                    const isSuccess =
                      text.toLowerCase().includes("deployed") ||
                      text.toLowerCase().includes("success");
                    return (
                      <div
                        key={i}
                        className={cn(
                          "pl-4 py-0.5",
                          isError
                            ? "text-red-400/80"
                            : isSuccess
                              ? "text-green-400/80"
                              : "text-muted-foreground/50",
                        )}
                      >
                        {text}
                      </div>
                    );
                  })}

                  {isRunning && (
                    <div className="flex items-center gap-1.5 pt-1">
                      {[0, 1, 2].map((n) => (
                        <span
                          key={n}
                          className="w-1 h-1 rounded-full bg-primary/70 animate-bounce"
                          style={{ animationDelay: `${n * 150}ms` }}
                        />
                      ))}
                      <span className="text-muted-foreground/40 ml-1">
                        running
                      </span>
                    </div>
                  )}
                </div>
              </ScrollArea>
            )}

            {activeTab === "tests" && (
              <ScrollArea className="flex-1 p-4">
                {testResults.length === 0 ? (
                  <p className="text-xs text-muted-foreground">
                    Run your code to see test results.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {testResults.map((result, i) => (
                      <div
                        key={i}
                        className={cn(
                          "rounded-lg border px-4 py-3 text-xs",
                          result.passed
                            ? "border-green-500/20 bg-green-500/5"
                            : "border-red-500/20 bg-red-500/5",
                        )}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          {result.passed ? (
                            <CheckCircle className="w-3.5 h-3.5 text-green-400 shrink-0" />
                          ) : (
                            <XCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />
                          )}
                          <span
                            className={
                              result.passed ? "text-green-400" : "text-red-400"
                            }
                          >
                            {result.name}
                          </span>
                        </div>
                        {!result.passed && (
                          <div className="pl-5 mt-2 space-y-1 text-muted-foreground">
                            <div>
                              <span className="text-white/40">expected </span>
                              <span className="text-green-400/80">
                                {result.expected}
                              </span>
                            </div>
                            <div>
                              <span className="text-white/40">got </span>
                              <span className="text-red-400/80">
                                {result.got}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            )}
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </ResizablePanel>
  );
}

/* =====================================================
   SHARED UI PRIMITIVES
===================================================== */

function TabButton({
  active,
  onClick,
  icon,
  label,
  badge,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  badge?: { text: string; passing: boolean };
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-1.5 px-3 py-2.5 text-sm tracking-tighter font-semibold transition-colors border-b -mb-px",
        active
          ? "border-primary text-foreground"
          : "border-transparent text-muted-foreground hover:text-foreground",
      )}
    >
      {icon}
      {label}
      {badge && (
        <span
          className={cn(
            "ml-0.5 px-1.5 py-0.5 rounded-full text-xs",
            badge.passing
              ? "bg-green-500/20 text-green-400"
              : "bg-red-500/20 text-red-400",
          )}
        >
          {badge.text}
        </span>
      )}
    </button>
  );
}

function LessonNavItem({
  title,
  lessonSlug,
  activeLessonSlug,
  completed,
}: {
  title: string;
  lessonSlug: string;
  activeLessonSlug: string;
  completed?: boolean;
}) {
  const active = activeLessonSlug === lessonSlug;

  return (
    <Link
      href={lessonSlug}
      className={cn(
        "w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors text-left group",
        active
          ? "bg-primary/10 text-primary"
          : "hover:bg-white/5 text-muted-foreground",
      )}
    >
      <div
        className={cn(
          "w-4 h-4 rounded-full border flex items-center justify-center shrink-0",
          completed
            ? "bg-primary border-primary"
            : "border-white/20 group-hover:border-white/40",
          active && !completed && "border-primary",
        )}
      >
        {completed && <CheckCircle className="w-3 h-3 text-black" />}
        {active && !completed && (
          <div className="w-1.5 h-1.5 rounded-full bg-primary" />
        )}
      </div>
      <span className="truncate text-pretty">{title}</span>
    </Link>
  );
}
