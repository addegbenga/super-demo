"use client";
import {
  Play,
  Clock,
  BookOpen,
  Globe,
  CheckCircle2,
  ChevronRight,
  Share2,
  Award,
  Zap,
  Shield,
  Twitter,
  Linkedin,
} from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@workspace/ui/components/accordion";
import { Badge } from "@workspace/ui/components/badge";
import Image from "next/image";
import { Card, CardContent, CardHeader } from "@workspace/ui/components/card";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";

import type {
  Achievement,
  Course,
  Instructor,
  Lesson,
  Module,
  Review,
} from "@workspace/sanity-client";

import { useQuery} from "@tanstack/react-query";
import { courseQueries, progressQueries } from "@/lib/queries/";
import { useCourse } from "@/hooks/use-course";
import { PortableTextRenderer } from "../markdown";
import { getCurrentUserId } from "@/hooks/auth";

type IProps = {
  courseId?: string;
  data: Course;
};

// ==================== COMPONENTS ====================

function CourseHero({ courseId, data }: IProps) {
  const {userId} = getCurrentUserId();
  const navigation = useRouter();
  const { enroll } = useCourse(courseId as string);
  const progress = useQuery(
    progressQueries.course(userId, data?._id as string),
  );

  const modules = data?.modules as unknown as Array<
    Omit<Module, "lessons"> & { lessons: Lesson[] }
  >;

  return (
    <div className="px-4">
      <div className="flex flex-col lg:flex-row gap-12 items-start">
        {/* Left: Thumbnail Card */}
        <div className="w-full lg:w-112.5 shrink-0">
          <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl group">
            <div className="aspect-video relative">
              <Image
                width={500}
                height={500}
                src={data?.thumbnail as any}
                alt="Solana Fundamentals"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent flex items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-primary/20 backdrop-blur-md flex items-center justify-center border border-primary/50 group-hover:scale-110 transition-transform cursor-pointer">
                  <Play className="w-6 h-6 text-primary fill-primary" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Info Section */}
        <div className="flex-1 space-y-3">
          <div className="flex items-center gap-2 text-sm font-mono text-muted-foreground">
            <span className="hover:text-primary cursor-pointer transition-colors">
              Courses
            </span>
            <ChevronRight className="w-4 h-4" />
            <span className="text-primary tracking-tight">{data?.title}</span>
          </div>

          <div className="flex items-center justify-between">
            <h1 className="text-3xl tracking-tighter line-clamp-1 font-bold">
              {data?.title}
            </h1>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full border border-white/5 bg-white/5 hover:bg-white/10"
            >
              <Share2 className="w-4 h-4" />
            </Button>
          </div>

          <p className="text-muted-foreground line-clamp-3 leading-relaxed max-w-3xl">
            {data?.description}
          </p>

          <div className="flex flex-wrap gap-6 text-sm font-medium text-muted-foreground border-y border-white/5 py-2">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" /> {data?.duration}hrs
            </div>
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-primary" />{" "}
              {data?.modules?.length} lessons
            </div>
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-primary" /> 2+ languages
            </div>
            <div className="flex items-center gap-2 capitalize">
              <Zap className="w-4 h-4 text-primary " /> {data?.difficulty}
            </div>
          </div>

          <div className="flex items-center gap-8">
            <Button
              disabled={progress.isPending}
              onClick={() => {
                if (!progress?.data?.enrolled) {
                  enroll.mutate(undefined, {
                    onSuccess() {
                      navigation.push(
                        `${courseId}/${modules[0]?.lessons?.[0]?.slug?.current}`,
                      );
                    },
                  });
                } else {
                  //Ideally navigate the user to their current lesson progress
                  navigation.push(
                    `${courseId}/${modules[0]?.lessons?.[0]?.slug?.current}`,
                  );
                }
              }}
              size="lg"
              className="font-bold w-40 px-4 shadow-[0_0_20px_-5px_rgba(20,241,149,0.5)] transition-all hover:scale-105 active:scale-95"
            >
              {progress.isPending
                ? "Loading..."
                : progress?.data?.enrolled
                  ? " Continue learning "
                  : "Start learning now"}
            </Button>

            {/* </Link> */}
            <div className="flex items-center gap-4">
              <div className="flex -space-x-2">
                {(() => {
                  const total = data?.stats?.totalEnrollments ?? 0;
                  const displayCount = total > 0 ? Math.min(total, 5) : 3;

                  return (
                    <>
                      {Array.from({ length: displayCount }).map((_, ind) => (
                        <div
                          key={ind}
                          className="w-8 h-8 rounded-full border-2 border-background bg-muted overflow-hidden ring-2 ring-primary/10"
                        >
                          <img
                            src={`https://i.pravatar.cc/100?img=${ind + 20}`}
                            alt="Student"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}

                      {total > 5 && (
                        <div className="w-8 h-8 flex items-center justify-center rounded-full border-2 border-background bg-primary text-primary-foreground text-xs font-semibold">
                          +{total - 5}
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>

              <span className="text-sm font-medium text-muted-foreground">
                {data?.stats?.totalEnrollments &&
                data.stats.totalEnrollments > 0
                  ? `${data.stats.totalEnrollments} Students enrolled`
                  : `1+ Students enrolled`}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function LearningObjectives({ data }: IProps) {
  return (
    <section className="space-y-6">
      <h3 className="text-xl tracking-tight font-bold">What you'll learn</h3>
      <div className="grid md:grid-cols-2 gap-y-4 gap-x-8">
        {data?.learningObjectives?.map((item, i) => (
          <div key={i} className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <span className="text-muted-foreground tracking-tight">
              {item.objective}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

function CourseDescription({ data }: IProps) {
  return (
    <section className="space-y-4">
      <h3 className="text-xl tracking-tight font-bold">Course description</h3>
      <PortableTextRenderer content={data?.fullDescription as any} />
      <Button
        variant="link"
        className="text-primary p-0 h-auto font-bold flex items-center gap-1 group"
      >
        Read more{" "}
        <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
      </Button>
    </section>
  );
}

function InstructorsSection({ data }: IProps) {
  const instructors = data?.instructors as unknown as Instructor[];
  return (
    <section className="space-y-6">
      <h3 className="text-xl tracking-tight font-bold">
        Meet your instructors
      </h3>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {instructors?.map((ins: Instructor) => (
          <div
            key={ins._id}
            className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/5 hover:border-primary/20 transition-all group"
          >
            <Avatar className="w-14 h-14 border border-white/10 group-hover:border-primary/50">
              <AvatarImage src={ins.avatar as unknown as string} />
              <AvatarFallback>{ins.name}</AvatarFallback>
            </Avatar>
            <div>
              <div className="font-bold text-white group-hover:text-primary transition-colors">
                {ins.name}
              </div>
              <div className="text-xs text-muted-foreground mb-2">
                {ins.role}
              </div>
              <div className="flex gap-2 transition-opacity">
                <Link href={ins?.social?.twitter as unknown as string}>
                  <Twitter className="w-3 h-3 cursor-pointer hover:text-primary" />
                </Link>
                <Link href={ins?.social?.linkedin as unknown as string}>
                  <Linkedin className="w-3 h-3 cursor-pointer hover:text-primary" />
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function SyllabusSection({ data }: IProps) {
  const modules = data?.modules as unknown as Array<
    Omit<Module, "lessons"> & { lessons: Lesson[] }
  >;
  const moduleDurations = modules?.map(
    (module) =>
      module.lessons?.reduce(
        (total, lesson) => total + (lesson.duration || 0),
        0,
      ) || 0,
  );

  return (
    <section>
      <h3 className="text-xl tracking-tight font-bold mb-6">Syllabus</h3>
      <div className="space-y-4">
        {modules?.map((module, i) => (
          <Accordion
            key={i}
            type="single"
            collapsible
            className="border border-white/5 rounded-xl bg-white/5 overflow-hidden"
          >
            <AccordionItem value={`item-${i}`} className="border-none">
              <AccordionTrigger className="px-6 py-4 **:data-[slot=accordion-trigger-icon]:mt-2 hover:no-underline transition-colors">
                <div className="flex items-center justify-between w-full pr-4">
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-lg bg-black/40 flex items-center justify-center font-bold text-sm text-primary border border-white/5">
                      {i + 1}
                    </div>
                    <span className="font-bold tracking-tight text-lg">
                      {module.title}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {moduleDurations}
                    </span>
                    <span className="flex items-center gap-1">
                      <BookOpen className="w-3 h-3" /> {module.lessons.length}{" "}
                      lessons
                    </span>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6 pt-2">
                <div className="space-y-1 ml-12 border-l border-white/10 pl-6">
                  {module.lessons.map((item, j) => (
                    <div
                      key={j}
                      className="flex items-center justify-between py-2 group cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        {j === 0 ? (
                          <Play className="w-3.5 h-3.5 text-primary" />
                        ) : (
                          <BookOpen className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
                        )}
                        <span className="text-muted-foreground group-hover:text-white transition-colors">
                          {item.title}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                        {item.duration}
                      </div>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        ))}
      </div>
    </section>
  );
}

function TestimonialsSection({
  data,
}: {
  data: IProps & { reviews: Review[] };
}) {
  return (
    <section className="space-y-10 pt-8">
      <div className="space-y-2">
        <h3 className="text-2xl font-bold">Testimonials</h3>
        <p className="text-muted-foreground">
          Here's what our students are saying about their experience with Solana
          Academy:
        </p>
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        {data?.reviews.map((t, i) => (
          <div
            key={i}
            className="p-6 rounded-2xl bg-white/5 border border-white/10 flex flex-col justify-between"
          >
            <p className="text-muted-foreground mb-6 italic leading-relaxed">
              "{t.content}"
            </p>
            <div className="flex items-center gap-4">
              <Avatar className="w-10 h-10 ring-2 ring-primary/20">
                <AvatarImage src={t.userAvatar as unknown as string} />
                <AvatarFallback>{t.userName}</AvatarFallback>
              </Avatar>
              <div>
                <div className="text-sm font-bold text-white">{t.userName}</div>
                <div className="text-[10px] text-primary uppercase tracking-widest">
                  {t.userRole}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function CourseSidebar({ data }: IProps) {
  const completionAchievement =
    data?.completionAchievement as unknown as Achievement;
  return (
    <div className="lg:w-87.5 shrink-0 space-y-6 sticky top-24 self-start">
      <Card className="border-white/10 bg-white/5 backdrop-blur-sm overflow-hidden border-t-primary/20 border-t-2">
        <CardHeader>
          <div className="flex items-center justify-between mb-2">
            <Badge className="bg-primary/20 text-primary border-primary/20">
              Available
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="aspect-square rounded-xl bg-linear-to-br from-primary/20 via-background to-secondary/20 border border-white/10 flex items-center justify-center relative overflow-hidden group">
            <Award className="w-20 h-20 text-primary opacity-50 group-hover:scale-110 transition-transform" />
            <div className="absolute inset-0 bg-grid-white/[0.05]" />
          </div>
          <div className="space-y-2">
            <h4 className="font-bold tracking-tighter line-clamp-1 text-lg">
              {completionAchievement?.description}
            </h4>
            <p className="text-sm text-muted-foreground">
              by{" "}
              <span className="text-primary font-bold">
                {completionAchievement?.name}
              </span>
            </p>
          </div>
          <Button
            variant="outline"
            className="w-full border-white/10 hover:bg-white/5 group"
          >
            Learn more{" "}
            <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </CardContent>
      </Card>

      <Card className="border-white/10 bg-white/5 backdrop-blur-sm">
        <CardContent className="p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center text-secondary">
            <Zap className="w-6 h-6 fill-current" />
          </div>
          <div className="flex-1">
            <div className="text-sm text-muted-foreground mb-1">
              This course is sponsored by
            </div>
            <div className="font-bold flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary" /> Solana Foundation
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ==================== MAIN COMPONENT ====================

export default function CourseDetail() {
  const params = useParams();
  const searchParams = useSearchParams();
  const courseId = params.courseId as string;
  const language = searchParams.get("lang") as string;
  const data = useQuery(courseQueries.bySlug(courseId, language));

  return (
    <div className="bg-background container mx-auto max-w-6xl pt-12 px-4 pb-24">
      {/* Course Hero Section */}
      <CourseHero
        data={data.data as Course}
        courseId={params.courseId as string}
      />

      {/* Content Tabs / Main Layout */}
      <div className="container mx-auto px-4 mt-24">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Left Column */}
          <div className="flex-1 space-y-16">
            <LearningObjectives data={data.data as Course} />
            <CourseDescription data={data.data as Course} />
            <InstructorsSection data={data.data as Course} />
            <SyllabusSection data={data.data as Course} />
            <TestimonialsSection data={data.data as any} />
          </div>
          {/* Right: Sidebar Cards */}
          <CourseSidebar data={data.data as Course} />
        </div>
      </div>
    </div>
  );
}
