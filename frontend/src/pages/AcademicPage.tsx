import React, { useEffect, useState } from 'react';
import api from '../api/client';
import { BookOpen, Calendar, Layers } from 'lucide-react';

export const AcademicPage: React.FC = () => {
  const [classes, setClasses] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [years, setYears] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [clsRes, subRes, yrRes] = await Promise.all([
          api.get('/academic/classes'),
          api.get('/academic/subjects'),
          api.get('/academic/years'),
        ]);
        setClasses(Array.isArray(clsRes.data) ? clsRes.data : []);
        setSubjects(Array.isArray(subRes.data) ? subRes.data : []);
        setYears(Array.isArray(yrRes.data) ? yrRes.data : []);
      } catch (e) {
        console.error(e);
        setClasses([]);
        setSubjects([]);
        setYears([]);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1D1D1F] tracking-tight">Academic Structure & Courses</h1>
        <p className="text-sm text-[#86868B]">
          Manage academic sessions, grade levels, sections, and curriculum subjects.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Classes Card - iOS Card */}
        <div className="ios-card rounded-[22px] p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-[#1D1D1F] flex items-center space-x-2">
              <div className="w-8 h-8 rounded-[10px] bg-[#0071E3]/10 text-[#0071E3] flex items-center justify-center">
                <Layers className="w-4 h-4" />
              </div>
              <span>Classes ({classes.length})</span>
            </h2>
          </div>
          <div className="space-y-2">
            {classes.map((c) => (
              <div key={c.id} className="p-3 bg-black/[0.02] border border-black/[0.04] rounded-[14px] flex items-center justify-between text-sm">
                <span className="font-semibold text-[#1D1D1F]">{c.name}</span>
                <span className="text-xs text-[#86868B]">Level {c.level}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Subjects Card - iOS Card */}
        <div className="ios-card rounded-[22px] p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-[#1D1D1F] flex items-center space-x-2">
              <div className="w-8 h-8 rounded-[10px] bg-[#5856D6]/10 text-[#5856D6] flex items-center justify-center">
                <BookOpen className="w-4 h-4" />
              </div>
              <span>Subjects ({subjects.length})</span>
            </h2>
          </div>
          <div className="space-y-2">
            {subjects.map((s) => (
              <div key={s.id} className="p-3 bg-black/[0.02] border border-black/[0.04] rounded-[14px] flex items-center justify-between text-sm">
                <span className="font-semibold text-[#1D1D1F]">{s.name}</span>
                <span className="text-xs font-mono bg-[#5856D6]/10 text-[#5856D6] px-2.5 py-0.5 rounded-full border border-[#5856D6]/20 font-semibold">
                  {s.code}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Academic Years Card - iOS Card */}
        <div className="ios-card rounded-[22px] p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-[#1D1D1F] flex items-center space-x-2">
              <div className="w-8 h-8 rounded-[10px] bg-emerald-500/10 text-[#34C759] flex items-center justify-center">
                <Calendar className="w-4 h-4" />
              </div>
              <span>Academic Years ({years.length})</span>
            </h2>
          </div>
          <div className="space-y-2">
            {years.map((y) => (
              <div key={y.id} className="p-3 bg-black/[0.02] border border-black/[0.04] rounded-[14px] space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-semibold text-[#1D1D1F]">{y.name}</span>
                  {y.is_active && (
                    <span className="px-2.5 py-0.5 text-xs font-semibold bg-emerald-500/10 text-[#34C759] rounded-full border border-emerald-500/20">
                      Active
                    </span>
                  )}
                </div>
                <div className="text-xs text-[#86868B]">
                  {y.start_date} to {y.end_date}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
