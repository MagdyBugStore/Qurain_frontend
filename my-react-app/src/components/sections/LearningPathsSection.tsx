import React from "react";
import { Link } from 'react-router-dom'
export default function LearningPathsSection() {
  const paths = [
    {
      icon: 'auto_stories',
      title: 'القاعدة النورانية',
      description: 'الأساس المتين للمبتدئين لتعلم الحروف العربية ومخارجها والنطق الصحيح.',
    },
    {
      icon: 'graphic_eq',
      title: 'التلاوة (ناظرة)',
      description: 'القراءة بطلاقة مع تطبيق أحكام التجويد بشكل صحيح وعملي.',
    },
    {
      icon: 'psychology',
      title: 'الحفظ (تحفيظ)',
      description: 'برنامج حفظ منظم مع استراتيجيات للمراجعة والتثبيت لعدم النسيان.',
    },
    {
      icon: 'mosque',
      title: 'الدراسات الإسلامية',
      description: 'فهم أساسيات العقيدة، العبادات، والأخلاق الإسلامية السمحة.',
    },
  ]

  return (
    <section className="py-20 bg-background-light">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <h2 className="text-primary text-sm font-bold uppercase tracking-wider mb-2">
            مسارات تعليمية مخصصة
          </h2>
          <h3 className="text-3xl md:text-4xl font-black text-text-main mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
            برامج مصممة لجميع الأعمار والمستويات
          </h3>
          <p className="text-text-muted text-lg">
            سواء كنت في بداية رحلتك أو تطمح لحفظ القرآن كاملاً، لدينا
            المسار المناسب لمستواك وأهدافك.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {paths.map((path, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md hover:border-primary/30 transition-all group"
            >
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary mb-5 group-hover:bg-primary group-hover:text-white transition-colors">
                <span className="material-symbols-outlined text-3xl">{path.icon}</span>
              </div>
              <h4 className="text-xl font-bold text-text-main mb-2">{path.title}</h4>
              <p className="text-text-muted text-sm leading-relaxed mb-4">
                {path.description}
              </p>
              <Link
                to="/programs"
                className="inline-flex items-center text-primary text-sm font-bold hover:underline"
              >
                اعرف المزيد
                <span className="material-symbols-outlined text-sm mr-1 rtl:rotate-180">
                  arrow_right_alt
                </span>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
