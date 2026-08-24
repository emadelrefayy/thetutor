import React, { useState } from 'react';
import { 
  BookOpen, PlayCircle, CheckCircle, HelpCircle, 
  ArrowLeft, Award, Sparkles, Hand, UserCheck, 
  Smile, Eye, Volume2, Wind, ShieldCheck, Hash, 
  Grid, Edit3, Layers, Disc, Square, Triangle, 
  Box, Sun, Feather, ArrowUp, Circle, ArrowDown, 
  Minus
} from 'lucide-react';

interface InfographicStep {
  step: number;
  title: string;
  description: string;
  icon?: string;
}

interface QuizQuestion {
  question: string;
  options: string[];
  answer: string;
}

interface Lesson {
  id: string;
  title: string;
  unit_number: number;
  lesson_number: number;
  content_summary: string;
  detailed_content?: string;
  vocabulary?: string[];
  infographic_steps?: InfographicStep[];
  quiz_data?: QuizQuestion[];
  interactive_game_type?: string;
}

interface LessonViewerProps {
  lesson: Lesson;
  onBack: () => void;
}

// خريطة الديناميكية للأيقونات
const renderIcon = (iconName?: string) => {
  const props = { className: "w-6 h-6 text-amber-400" };
  switch (iconName) {
    case 'Hand': return <Hand {...props} />;
    case 'UserCheck': return <UserCheck {...props} />;
    case 'Smile': return <Smile {...props} />;
    case 'Eye': return <Eye {...props} />;
    case 'Volume2': return <Volume2 {...props} />;
    case 'Wind': return <Wind {...props} />;
    case 'ShieldCheck': return <ShieldCheck {...props} />;
    case 'Hash': return <Hash {...props} />;
    case 'Grid': return <Grid {...props} />;
    case 'Edit3': return <Edit3 {...props} />;
    case 'Layers': return <Layers {...props} />;
    case 'Disc': return <Disc {...props} />;
    case 'Square': return <Square {...props} />;
    case 'Triangle': return <Triangle {...props} />;
    case 'Box': return <Box {...props} />;
    case 'Sun': return <Sun {...props} />;
    case 'Feather': return <Feather {...props} />;
    case 'ArrowUp': return <ArrowUp {...props} />;
    case 'Circle': return <Circle {...props} />;
    case 'ArrowDown': return <ArrowDown {...props} />;
    case 'Minus': return <Minus {...props} />;
    default: return <Sparkles {...props} />;
  }
};

export default function LessonViewer({ lesson, onBack }: LessonViewerProps) {
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: number]: string }>({});
  const [showResults, setShowResults] = useState(false);

  const handleSelectOption = (qIndex: number, option: string) => {
    setSelectedAnswers(prev => ({ ...prev, [qIndex]: option }));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 dir-rtl">
      {/* هيدر الدرس وزر العودة */}
      <div className="flex items-center justify-between bg-slate-900 border border-slate-800 p-4 rounded-2xl">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          العودة للمناهج
        </button>
        <span className="text-xs bg-amber-400/20 text-amber-300 px-3 py-1 rounded-full font-black">
          الوحدة {lesson.unit_number} - الدرس {lesson.lesson_number}
        </span>
      </div>

      {/* عنوان الدرس والشرح الإثري */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl space-y-4">
        <div className="flex items-center gap-3">
          <BookOpen className="w-7 h-7 text-amber-400" />
          <h1 className="text-2xl font-black text-slate-100">{lesson.title}</h1>
        </div>
        <p className="text-slate-300 text-sm leading-relaxed border-r-4 border-amber-400 pr-4 py-1">
          {lesson.detailed_content || lesson.content_summary}
        </p>

        {/* الكلمات المفتاحية Vocabulary */}
        {lesson.vocabulary && lesson.vocabulary.length > 0 && (
          <div className="pt-3 border-t border-slate-800">
            <h3 className="text-xs font-bold text-slate-400 mb-2">الكلمات المفتاحية (Key Vocabulary):</h3>
            <div className="flex flex-wrap gap-2">
              {lesson.vocabulary.map((word, idx) => (
                <span key={idx} className="bg-slate-800 text-amber-300 border border-slate-700 font-bold px-3 py-1 rounded-xl text-xs">
                  {word}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* قسم الإنفوجرافيك البصري التفاعلي Infographic Steps */}
      {lesson.infographic_steps && lesson.infographic_steps.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-black text-slate-100">الإنفوجرافيك التعليمي التفاعلي</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {lesson.infographic_steps.map((step) => (
              <div 
                key={step.step} 
                className="bg-slate-950 border border-slate-800 p-4 rounded-2xl flex items-start gap-4 hover:border-amber-500/50 transition-all shadow-md"
              >
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 shrink-0">
                  {renderIcon(step.icon)}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black bg-amber-400 text-slate-950 px-2 py-0.5 rounded-md">
                      خطوة {step.step}
                    </span>
                    <h4 className="font-bold text-slate-200 text-sm">{step.title}</h4>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* قسم الأسئلة والأنشطة التفاعلية Quiz Section */}
      {lesson.quiz_data && lesson.quiz_data.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-400" />
              <h2 className="text-lg font-black text-slate-100">نشاط الدرس التفاعلي</h2>
            </div>
            <button
              onClick={() => setShowResults(!showResults)}
              className="px-4 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl transition-all"
            >
              {showResults ? 'إخفاء النتيجة' : 'تحقق من إجاباتك'}
            </button>
          </div>

          <div className="space-y-4">
            {lesson.quiz_data.map((q, qIndex) => (
              <div key={qIndex} className="bg-slate-950 border border-slate-800 p-4 rounded-2xl space-y-3">
                <p className="text-xs font-bold text-slate-200 flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-amber-400" />
                  {qIndex + 1}. {q.question}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {q.options.map((opt, optIndex) => {
                    const isSelected = selectedAnswers[qIndex] === opt;
                    const isCorrect = opt === q.answer;
                    
                    let btnStyle = "bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700";
                    if (isSelected) {
                      btnStyle = "bg-amber-500/20 border-amber-500 text-amber-300 font-bold";
                    }
                    if (showResults) {
                      if (isCorrect) {
                        btnStyle = "bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold";
                      } else if (isSelected && !isCorrect) {
                        btnStyle = "bg-rose-500/20 border-rose-500 text-rose-300 font-bold";
                      }
                    }

                    return (
                      <button
                        key={optIndex}
                        onClick={() => handleSelectOption(qIndex, opt)}
                        className={`p-2.5 rounded-xl border text-xs text-right transition-all flex items-center justify-between ${btnStyle}`}
                      >
                        <span>{opt}</span>
                        {showResults && isCorrect && <CheckCircle className="w-4 h-4 text-emerald-400" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
