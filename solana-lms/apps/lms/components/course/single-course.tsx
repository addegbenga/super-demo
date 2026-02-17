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
} from "lucide-react";
import { useState } from "react";
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
import { INITIAL_CODE } from "@/lib/data";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { courseQueries, lessonQueries, progressQueries } from "@/lib/queries";
import { Lesson, Module } from "@workspace/sanity-client";

/* =====================================================
   TYPES
===================================================== */

interface FlatLesson {
  id: string; // lesson._id — stable identifier stored in completedLessons
  slug: string;
  title: string;
}

interface LessonNavigation {
  currentId: string;
  prev: FlatLesson | null;
  next: FlatLesson | null;
  isCurrentCompleted: boolean;
}

interface LayoutProps {
  courseId: string;
  lessonSlug: string;
  language: string;
  nav: LessonNavigation;
  onNext: () => void;
  allLessons: FlatLesson[];
  completedLessons: string[];
  completionPercentage: number;
  showCodeEditor: boolean;
  setShowCodeEditor: React.Dispatch<React.SetStateAction<boolean>>;
  isRunning: boolean;
  consoleOutput: string[];
  runCode: () => void;
}

/* =====================================================
   BUSINESS LOGIC — code runner
===================================================== */

function useCourseRunner() {
  const [isRunning, setIsRunning] = useState(false);
  const [consoleOutput, setConsoleOutput] = useState<string[]>([]);

  const runCode = () => {
    setIsRunning(true);
    setConsoleOutput([]);

    setTimeout(() => {
      setConsoleOutput((prev) => [...prev, "> Compiling program..."]);
    }, 500);

    setTimeout(() => {
      setConsoleOutput((prev) => [...prev, "> Deploying to Devnet..."]);
    }, 1500);

    setTimeout(() => {
      setConsoleOutput((prev) => [
        ...prev,
        "> Program deployed: Fg6P...LnS",
        "> Transaction signature: 5Kj3...9zX",
        "> Logs:",
        "  Program log: Hello Solana!",
        "  Program consumed: 1240 compute units",
      ]);
      setIsRunning(false);
      toast("Success!", {
        description: "Program deployed and executed successfully +50 XP",
      });
    }, 2500);
  };

  return { isRunning, consoleOutput, runCode };
}

/* =====================================================
   HELPERS
===================================================== */

/** Flatten all lessons across modules into a single ordered list */
function flattenLessons(
  modules: Array<Omit<Module, "lessons"> & { lessons: Lesson[] }>,
): FlatLesson[] {
  return (modules ?? []).flatMap((mod) =>
    (mod.lessons ?? []).map((lesson) => ({
      id: lesson._id,
      slug: lesson.slug?.current as string,
      title: lesson.title as string,
    })),
  );
}

/* =====================================================
   SMART CONTAINER — single place where params are read
===================================================== */

export default function Course() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const courseId = params.courseId as string;
  const lessonSlug = params.courseLessonId?.[0] as string;
  const language = searchParams.get("lang") as string;
  const userId = "1234";

  const [showCodeEditor, setShowCodeEditor] = useState(false);
  const { isRunning, consoleOutput, runCode } = useCourseRunner();

  const { data: course } = useQuery(courseQueries.bySlug(courseId, language));
  const { data: progress } = useQuery(progressQueries.course(userId, courseId));

  const modules = course?.modules as unknown as Array<
    Omit<Module, "lessons"> & { lessons: Lesson[] }
  >;

  const allLessons = flattenLessons(modules ?? []);
  const currentLesson = allLessons.find((l) => l.slug === lessonSlug);
  const currentIndex = currentLesson ? allLessons.indexOf(currentLesson) : -1;

  const completedLessons: string[] = progress?.completedLessons ?? [];
  const completionPercentage = progress?.completionPercentage ?? 0;

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
      // TODO: call your mutation here, e.g.:
      // markLessonComplete({ userId, courseId, lessonId: currentLesson.id })
    }

    if (nav.next) {
      router.push(`${nav.next.slug}`);
    }
  };

  return (
    <CourseLayout
      courseId={courseId}
      lessonSlug={lessonSlug}
      language={language}
      nav={nav}
      onNext={handleNext}
      allLessons={allLessons}
      completedLessons={completedLessons}
      completionPercentage={completionPercentage}
      showCodeEditor={showCodeEditor}
      setShowCodeEditor={setShowCodeEditor}
      isRunning={isRunning}
      consoleOutput={consoleOutput}
      runCode={runCode}
    />
  );
}

/* =====================================================
   LAYOUT
===================================================== */

function CourseLayout({
  courseId,
  lessonSlug,
  language,
  nav,
  onNext,
  allLessons,
  completedLessons,
  completionPercentage,
  showCodeEditor,
  setShowCodeEditor,
  isRunning,
  consoleOutput,
  runCode,
}: LayoutProps) {
  return (
    <div className="text-foreground bg-background h-[calc(100vh-5rem)] flex flex-col">
      <CourseHeader
        lessonSlug={lessonSlug}
        showCodeEditor={showCodeEditor}
        toggleEditor={() => setShowCodeEditor((prev) => !prev)}
        runCode={runCode}
        isRunning={isRunning}
      />

      <ResizablePanelGroup orientation="horizontal" className="h-full">
        <CourseSidebar
          courseId={courseId}
          lessonSlug={lessonSlug}
          language={language}
          allLessons={allLessons}
          completedLessons={completedLessons}
          completionPercentage={completionPercentage}
        />

        <ResizableHandle />

        <LessonSection
          lessonSlug={lessonSlug}
          language={language}
          showCodeEditor={showCodeEditor}
          nav={nav}
          onNext={onNext}
        />

        {showCodeEditor && (
          <>
            <ResizableHandle className="bg-white/5 hover:bg-primary/50 transition-colors w-1" />
            <EditorSection
              runCode={runCode}
              consoleOutput={consoleOutput}
              isRunning={isRunning}
            />
          </>
        )}
      </ResizablePanelGroup>
    </div>
  );
}

/* =====================================================
   HEADER
===================================================== */

function CourseHeader({
  lessonSlug,
  showCodeEditor,
  toggleEditor,
}: {
  lessonSlug: string;
  showCodeEditor: boolean;
  toggleEditor: () => void;
  runCode: () => void;
  isRunning: boolean;
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

        <div className="flex flex-col">
          <h1 className="text-sm text-muted-foreground truncate text-pretty capitalize font-bold">{lessonSlug}</h1>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden md:flex items-center gap-2 text-xs font-mono bg-white/5 px-3 py-1.5 rounded-md border border-white/5">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          Devnet Active
        </div>

        <Button
          variant="ghost"
          size="sm"
          className={cn("h-8 gap-2", showCodeEditor && "bg-white/10")}
          onClick={toggleEditor}
        >
          <Code className="w-4 h-4" />
          <span className="hidden sm:inline">
            {showCodeEditor ? "Hide" : "Show"} Editor
          </span>
        </Button>
      </div>
    </header>
  );
}

/* =====================================================
   SIDEBAR
===================================================== */

function CourseSidebar({
  courseId,
  lessonSlug,
  language,
  allLessons,
  completedLessons,
  completionPercentage,
}: {
  courseId: string;
  lessonSlug: string;
  language: string;
  allLessons: FlatLesson[];
  completedLessons: string[];
  completionPercentage: number;
}) {
  const { data: course } = useQuery(courseQueries.bySlug(courseId, language));

  const modules = course?.modules as unknown as Array<
    Omit<Module, "lessons"> & { lessons: Lesson[] }
  >;

  return (
    <ResizablePanel
      collapsible
      maxSize={300}
      className="bg-black/20 border-r border-white/5"
    >
      <div className="h-full flex flex-col">
        <div className="p-4 border-b border-white/5">
          <p className="font-medium tracking-tight text-sm mb-1.5">
            Course progress
          </p>
          <Progress value={completionPercentage} className="h-1 bg-white/10" />
          <p className="text-sm tracking-tight text-muted-foreground mt-1.5">
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
                      <LessonItem
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
    </ResizablePanel>
  );
}

/* =====================================================
   LESSON SECTION
===================================================== */

function LessonSection({
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
  const { data } = useQuery(lessonQueries.bySlug(lessonSlug, language));

  return (
    <ResizablePanel
      defaultSize={showCodeEditor ? 40 : 75}
      minSize={30}
      className="flex flex-col h-full"
    >
      <ScrollArea className="flex-1">
        <div className="py-3 px-6 flex flex-col justify-between max-w-3xl mx-auto">
          <PortableTextRenderer content={data?.content as any} />

          <div className="p-6 my-5 bg-blue-500/5 border border-blue-500/10 rounded-xl">
            <h4 className="flex items-center gap-2 font-bold text-blue-400 mb-2">
              <Trophy className="w-4 h-4" /> Challenge
            </h4>
            <p className="text-sm">
              Modify the program to log "Hello [Your Name]" instead of "Hello
              Solana!". Deploy it to verify your completion.
            </p>
          </div>
        </div>
      </ScrollArea>

      <LessonFooter nav={nav} onNext={onNext} language={language} />
    </ResizablePanel>
  );
}

/* =====================================================
   LESSON NAV — prev / next
===================================================== */

function LessonFooter({
  nav,
  onNext,
  language,
}: {
  nav: LessonNavigation;
  onNext: () => void;
  language: string;
}) {
  const { prev, next, isCurrentCompleted } = nav;

  return (
    <div className="flex p-3 border-t justify-between items-center bg-background">
      {/* Previous — disabled on first lesson */}
      {prev ? (
        <Link href={`${prev.slug}`}>
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

      {/* Next — label reflects whether this lesson still needs completing */}
      {next ? (
        <Button
          variant="outline"
          onClick={onNext}
          className="gap-1.5 text-muted-foreground"
        >
          {isCurrentCompleted ? (
            <>
              <span className="hidden sm:inline">Next Lesson</span>
              <ChevronRight className="w-4 h-4" />
            </>
          ) : (
            <>
              <span className="hidden sm:inline">Complete & Continue</span>
              <ChevronRight className="w-4 h-4" />
            </>
          )}
        </Button>
      ) : (
        // Last lesson — only show if not yet completed
        !isCurrentCompleted && (
          <Button
            variant="outline"
            onClick={onNext}
            className="gap-1.5 text-muted-foreground"
          >
            {/* <CheckCircle className="w-4 h-4" /> */}
            <span className="hidden sm:inline">Complete Lesson</span>
            <ChevronRight className="w-4 h-4" />
          </Button>
        )
      )}
    </div>
  );
}

/* =====================================================
   EDITOR SECTION
===================================================== */

function EditorSection({
  consoleOutput,
  isRunning,
  runCode,
}: {
  consoleOutput: string[];
  isRunning: boolean;
  runCode: () => void;
}) {
  return (
    <ResizablePanel defaultSize={350} minSize={350} className="flex flex-col">
      <ResizablePanelGroup orientation="vertical">
        <CodeEditorPanel />
        <ResizableHandle className="h-1" />
        <TerminalPanel
          runCode={runCode}
          consoleOutput={consoleOutput}
          isRunning={isRunning}
        />
      </ResizablePanelGroup>
    </ResizablePanel>
  );
}

function CodeEditorPanel() {
  return (
    <ResizablePanel collapsible>
      <div className="h-full flex flex-col bg-muted">
        <div className="h-9 border-b border-border flex items-center px-4 bg-black/20">
          <div className="px-3 py-1 border-t-2 text-muted-foreground border-primary text-xs font-mono">
            lib.rs
          </div>
        </div>
        <div className="flex-1">
          <MonacoEditor value={INITIAL_CODE} onChange={() => {}} />
        </div>
      </div>
    </ResizablePanel>
  );
}

function TerminalPanel({
  consoleOutput,
  isRunning,
  runCode,
}: {
  consoleOutput: string[];
  isRunning: boolean;
  runCode: () => void;
}) {
  return (
    <ResizablePanel defaultSize={30} minSize={30}>
      <div className="h-full flex flex-col bg-background">
        <div className="h-11 p-2 font-mono border-b justify-between border-border flex items-center px-4">
          <span className="text-xs font-mono font-bold text-muted-foreground flex items-center gap-2">
            <Terminal className="w-3 h-3" /> TERMINAL
          </span>
          <Button
            size="sm"
            variant="ghost"
            className="h-5 w-fit text-muted-foreground hover:bg-primary/90 font-bold"
            onClick={runCode}
            disabled={isRunning}
          >
            {isRunning ? "Running" : "Run"}
            <Play className="w-2 h-2 fill-current" />
          </Button>
        </div>

        <ScrollArea className="flex-1 p-4 font-mono text-sm">
          <div className="space-y-1">
            <div className="text-muted-foreground">$ solana --version</div>
            <div className="text-muted-foreground">
              solana-cli 1.18.0 (src:devbuild)
            </div>

            {consoleOutput.map((line, i) => (
              <div
                key={i}
                className={cn(
                  line.startsWith(">")
                    ? "text-primary"
                    : "text-muted-foreground pl-4",
                )}
              >
                {line}
              </div>
            ))}

            {isRunning && (
              <div className="flex items-center gap-1 text-primary animate-pulse">
                <span className="w-2 h-4 bg-primary block" />
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </ResizablePanel>
  );
}

/* =====================================================
   LESSON ITEM
===================================================== */

function LessonItem({
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
