import Link from "next/link";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 px-4">
      <div className="flex flex-col items-center gap-2 text-center">
        <span className="text-8xl font-bold text-muted-foreground/30">404</span>
        <h1 className="text-h1 text-foreground">Page not found</h1>
        <p className="text-regular text-muted-foreground max-w-md">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
      </div>
      <div className="flex gap-3">
        <Button asChild>
          <Link href="/">Go home</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/articles">Browse articles</Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
