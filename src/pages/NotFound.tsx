import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  return (
    <main className="min-h-screen flex items-center justify-center px-6 bg-noir">
      <motion.div
        className="max-w-2xl w-full text-center space-y-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-[120px] md:text-[200px] font-display font-bold tracking-tighter leading-none text-gold">
          404
        </h1>
        <h2 className="text-3xl md:text-4xl font-display">Page not found</h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          The page you're looking for has drifted into the void.
        </p>
        <Button asChild size="lg" className="bg-gold text-primary-foreground hover:opacity-90 group">
          <Link to="/">
            <ArrowLeft className="mr-2 size-5 transition-transform group-hover:-translate-x-1" />
            Back home
          </Link>
        </Button>
      </motion.div>
    </main>
  );
};

export default NotFound;
