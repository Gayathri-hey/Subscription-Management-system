import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FileQuestion, Home, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 text-center bg-background text-foreground">
      <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-primary/10 border border-primary/20 text-primary mb-6 shadow-inner">
        <FileQuestion className="h-10 w-10 text-primary" />
      </div>

      <span className="text-sm font-bold uppercase tracking-widest text-primary font-mono mb-2">
        404 — Not Found
      </span>

      <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground mb-3">
        Page Does Not Exist
      </h1>

      <p className="max-w-md text-sm text-muted-foreground mb-8">
        The dashboard route or resource you requested could not be located. It may have been moved or you may need different permission credentials.
      </p>

      <div className="flex items-center space-x-3">
        <Button
          variant="outline"
          onClick={() => navigate(-1)}
          leftIcon={<ArrowLeft className="h-4 w-4" />}
        >
          Go Back
        </Button>
        <Button
          onClick={() => navigate('/')}
          leftIcon={<Home className="h-4 w-4" />}
        >
          Dashboard Home
        </Button>
      </div>
    </div>
  );
};

export default NotFoundPage;

