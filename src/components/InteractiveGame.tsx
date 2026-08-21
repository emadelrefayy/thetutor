import React, { useState } from 'react';

interface Question {
  id: number;
  question: string;
  options: string[];
  correct_option_index: number;
}

interface GameProps {
  title: string;
  initialQuestions?: Question[];
}

const InteractiveGame: React.FC<GameProps> = ({ title, initialQuestions }) => {
  const defaultQuestions: Question[] = [
    { id: 1, question: "ما هو الحرف الأول في كلمة (أحمد)؟", options: ["أ", "ب", "ت", "ث"], correct_option_index: 0 },
    { id: 2, question: "ما الناتج من: 5 + 3؟", options: ["6", "7", "8", "9"], correct_option_index: 2 },
    { id: 3, question: "ما هي المادة التي تدرس الكائنات الحية؟", options: ["Math", "Science", "Arabic", "ICT"], correct_option_index: 1 },
    { id: 4, question: "Translate: (Apple) to Arabic", options: ["موز", "تفاحة", "برتقال", "عنب"], correct_option_index: 1 },
    { id: 5, question: "كم عدد أركان الإسلام؟", options: ["3", "4", "5", "6"], correct_option_index: 2 },
    { id: 6, question: "عاصمة مصر هي مدينة...؟", options: ["الإسكندرية", "القاهرة", "أسوان", "الجيزة"], correct_option_index: 1 },
    { id: 7, question: "ما هي أداة قياس الطول؟", options: ["المسطرة", "الترمومتر", "الميزان", "البوصلة"], correct_option_index: 0 },
    { id: 8, question: "أي مما يلي يُعد من الأجهزة الذكية؟", options: ["الكتاب", "الحاسوب", "القلم", "الكرسي"], correct_option_index: 1 },
    { id: 9, question: "What is the capital of Egypt?", options: ["Cairo", "Giza", "Alexandria", "Luxor"], correct_option_index: 0 },
  ];

  const [questions, setQuestions] = useState<Question[]>(initialQuestions || defaultQuestions);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isFinished, setIsFinished] = useState(false);

  const handleSelect = (index: number) => {
    setSelectedOption(index);
    if (index === questions[currentIndex].correct_option_index) {
      setScore(prev => prev + 1);
    }
  };

  const handleNext = () => {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(prev => prev + 1);
      setSelectedOption(null);
    } else {
      setIsFinished(true);
    }
  };

  const addMoreQuestions = () => {
    const nextId = questions.length + 1;
    const newQ: Question = {
      id: nextId,
      question: `سؤال إضافي رقم ${nextId}: اختبر معلوماتك العامة؟`,
      options: ["إجابة صحيح", "خيار ثانٍ", "خيار ثالث", "خيار رابع"],
      correct_option_index: 0
    };
    setQuestions(prev => [...prev, newQ]);
  };

  return (
    <div className="bg-white/95 backdrop-blur-md rounded-3xl p-8 shadow-xl border-4 border-amber-200 max-w-2xl mx-auto relative z-10 my-8">
      <div className="flex items-center justify-between border-b pb-4 mb-6">
        <h2 className="text-2xl font-black text-amber-700 flex items-center gap-2">
          🎮 {title}
        </h2>
        <button
          onClick={addMoreQuestions}
          className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm px-4 py-2 rounded-full shadow transition-transform hover:scale-105"
        >
          ➕ إضافة أسئلة (+ Add Questions)
        </button>
      </div>

      {!isFinished ? (
        <div>
          <div className="flex justify-between items-center text-sm font-bold text-gray-500 mb-4">
            <span>السؤال {currentIndex + 1} من {questions.length}</span>
            <span>النقاط: 🌟 {score}</span>
          </div>

          <p className="text-xl font-bold text-gray-800 mb-6 bg-amber-50 p-4 rounded-2xl border border-amber-100">
            {questions[currentIndex]?.question}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            {questions[currentIndex]?.options.map((opt, idx) => (
              <button
                key={idx}
                onClick={() => handleSelect(idx)}
                disabled={selectedOption !== null}
                className={`p-4 rounded-2xl font-bold text-lg text-right transition-all border-2 ${
                  selectedOption === idx
                    ? idx === questions[currentIndex].correct_option_index
                      ? 'bg-emerald-500 text-white border-emerald-600'
                      : 'bg-rose-500 text-white border-rose-600'
                    : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-amber-100 hover:border-amber-300'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>

          {selectedOption !== null && (
            <button
              onClick={handleNext}
              className="w-full bg-amber-500 hover:bg-amber-600 text-white font-black py-3 rounded-2xl shadow-lg transition-transform hover:scale-102"
            >
              {currentIndex + 1 < questions.length ? 'السؤال التالي ➡️' : 'عرض النتيجة 🏆'}
            </button>
          )}
        </div>
      ) : (
        <div className="text-center py-8">
          <span className="text-6xl mb-4 block">🏆</span>
          <h3 className="text-3xl font-black text-amber-600 mb-2">أحسنت يا بطل!</h3>
          <p className="text-xl font-bold text-gray-700 mb-6">
            حصلت على <span className="text-emerald-600 font-extrabold">{score}</span> من <span className="text-amber-600 font-extrabold">{questions.length}</span>
          </p>
          <button
            onClick={() => {
              setCurrentIndex(0);
              setScore(0);
              setSelectedOption(null);
              setIsFinished(false);
            }}
            className="bg-amber-500 hover:bg-amber-600 text-white font-bold px-8 py-3 rounded-full shadow-lg"
          >
            إعادة اللعبة 🔄
          </button>
        </div>
      )}
    </div>
  );
};

export default InteractiveGame;
