import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, MessageSquare, GraduationCap, Sparkles } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="border-b bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-8 h-8 text-primary" />
            <h1 className="text-2xl font-bold">VibePaper</h1>
          </div>
          <nav className="flex gap-4">
            <Link href="/chat">
              <Button variant="default">
                <MessageSquare className="w-4 h-4 mr-2" />
                Create Paper
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-6">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-medium">AI-Powered Test Generation</span>
          </div>
          <h2 className="text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400">
            Create Custom Test Papers in Seconds
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Generate high-quality, customized test questions for K-12 students using advanced AI.
            Perfect for teachers and parents.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/chat">
              <Button size="lg" className="gap-2">
                <MessageSquare className="w-5 h-5" />
                Start Creating
              </Button>
            </Link>
            <Link href="/exam">
              <Button size="lg" variant="outline" className="gap-2">
                <FileText className="w-5 h-5" />
                Take Exam
              </Button>
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <Card className="border-2 hover:border-primary/50 transition-colors">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-4">
                <MessageSquare className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <CardTitle>Chat-Based Creation</CardTitle>
              <CardDescription>
                Simply describe what you need - grade level, topic, difficulty - and let AI do the rest
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:border-primary/50 transition-colors">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mb-4">
                <FileText className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <CardTitle>Multiple Question Types</CardTitle>
              <CardDescription>
                Support for multiple choice, fill-in-the-blank, and essay questions with auto-grading
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:border-primary/50 transition-colors">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4">
                <Sparkles className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <CardTitle>Math Formula Support</CardTitle>
              <CardDescription>
                Beautiful LaTeX rendering for mathematical expressions and scientific notation
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* How It Works */}
        <div className="max-w-3xl mx-auto mt-20">
          <h3 className="text-3xl font-bold text-center mb-12">How It Works</h3>
          <div className="space-y-6">
            {[
              {
                step: '1',
                title: 'Describe Your Needs',
                description: 'Tell the AI what topic, grade level, and difficulty you need',
              },
              {
                step: '2',
                title: 'AI Generates Questions',
                description: 'Our AI creates high-quality questions with detailed explanations',
              },
              {
                step: '3',
                title: 'Share & Grade',
                description: 'Share a unique link with students and get auto-graded results',
              },
            ].map((item) => (
              <div key={item.step} className="flex gap-4 items-start p-6 rounded-lg bg-card border">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                  {item.step}
                </div>
                <div>
                  <h4 className="font-semibold text-lg mb-1">{item.title}</h4>
                  <p className="text-muted-foreground">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t mt-20 py-8 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>VibePaper - AI-Powered Test Paper Generation for K-12 Education</p>
        </div>
      </footer>
    </div>
  );
}
