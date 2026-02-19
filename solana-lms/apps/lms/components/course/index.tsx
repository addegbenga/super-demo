"use client";
import { courseQueries } from "@/lib/queries";
import { useQuery} from "@tanstack/react-query";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { Clock, Zap, AlertCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Input } from "@workspace/ui/components/input";
import { Search, Filter } from "lucide-react";

export function CourseHeader() {
  return (
    <div className="flex flex-col gap-6 mb-12">
      <div>
        <h1 className="text-3xl tracking-tighter font-bold mb-2">
          Course Catalog
        </h1>
        <p className="text-muted-foreground text-lg">
          Master the Solana ecosystem with expert-led courses.
        </p>
      </div>

      <div className="flex w-full md:w-auto gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search courses..."
            className="pl-10 h-11 bg-white/5 border-white/10"
          />
        </div>
        <Button variant="outline" className="border-white/10 h-11 bg-white/5">
          <Filter className="w-4 h-4 mr-2" /> Filter
        </Button>
      </div>
    </div>
  );
}

export function CourseGrid() {
  const searchParams = useSearchParams();
  const language = searchParams.get("lang") as string;
  const { data, isError, error, refetch } = useQuery(
    courseQueries.all(language),
  );

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4">
        <div className="rounded-full bg-destructive/10 p-4 mb-4">
          <AlertCircle className="w-12 h-12 text-destructive" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Failed to Load Courses</h2>
        <p className="text-muted-foreground truncate text-center mb-6 max-w-md">
          {error?.message ||
            "Something went wrong while fetching the courses. Please try again."}
        </p>
        <Button onClick={() => refetch()} variant="default">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
      {data?.map((course) => (
        <Link
          key={course._id}
          href={`/course/${course.slug?.current}`}
          prefetch={true}
        >
          <div className="group relative rounded-2xl overflow-hidden border border-white/10 bg-card hover:border-primary/50 transition-all duration-300 cursor-pointer h-full flex flex-col">
            <div className="aspect-video h-44 relative overflow-hidden">
              <div className="absolute inset-0 bg-linear-to-t from-black/80 to-transparent z-10" />
              <Image
                width={200}
                height={200}
                src={course.thumbnail as any}
                alt={course?.slug?.source || ""}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute bottom-4 left-4 z-20 flex gap-2">
                <Badge
                  variant="secondary"
                  className="bg-black/50 backdrop-blur-md border-white/10"
                >
                  {/* {course.progress}% Completed */}
                </Badge>
              </div>
            </div>
            <div className="p-6 pb-0 flex flex-col flex-1">
              <h3 className="tracking-tight font-bold mb-2 group-hover:text-primary transition-colors">
                {course.title}
              </h3>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {course.description}
              </p>
              <div className="grid pt-2.5 space-y-2">
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {course.duration}
                  </span>
                  <span className="flex items-center gap-1 text-primary">
                    <Zap className="w-3 h-3" /> {course.xpReward} XP
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}

export function AllCourse() {
  return (
    <div className="container max-w-5xl mx-auto px-4 py-12">
      <CourseHeader />
      <CourseGrid />
    </div>
  );
}
