import React, { useState } from 'react';
import { dataService } from '../services/dataService';
import { Patient } from '../types';

interface Props {
  onUpdate: (p: Patient) => void;
}

export const DataEntry: React.FC<Props> = ({ onUpdate }) => {
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'MANUAL' | 'UPLOAD'>('MANUAL');
  
  // Form State
  const [systolic, setSystolic] = useState('');
  const [diastolic, setDiastolic] = useState('');
  const [heartRate, setHeartRate] = useState('');
  const [glucose, setGlucose] = useState('');
  const [temperature, setTemperature] = useState('');
  const [notes, setNotes] = useState('');

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const patient = await dataService.addVitalRecord({
        source: 'MANUAL',
        systolic: Number(systolic),
        diastolic: Number(diastolic),
        heartRate: Number(heartRate),
        glucose: glucose ? Number(glucose) : undefined,
        temperature: temperature ? Number(temperature) : undefined,
        notes
      });
      onUpdate(patient);
      setSystolic(''); setDiastolic(''); setHeartRate(''); setGlucose(''); setTemperature(''); setNotes('');
    } catch (err) {
      alert("Failed to save record");
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setLoading(true);
    try {
      const patient = await dataService.processHospitalUpload(e.target.files[0]);
      onUpdate(patient);
      alert("Hospital report processed successfully!");
    } catch (err) {
      alert("Error processing file");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 overflow-hidden">
      <div className="p-1.5 bg-zinc-50 border-b border-zinc-200 flex gap-1">
        <button 
          onClick={() => setMode('MANUAL')}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${mode === 'MANUAL' ? 'bg-white text-red-600 shadow-sm border border-zinc-200' : 'text-zinc-500 hover:text-zinc-700'}`}
        >
          Manual Entry
        </button>
        <button 
          onClick={() => setMode('UPLOAD')}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${mode === 'UPLOAD' ? 'bg-white text-red-600 shadow-sm border border-zinc-200' : 'text-zinc-500 hover:text-zinc-700'}`}
        >
          Hospital Upload
        </button>
      </div>

      <div className="p-6">
        {mode === 'MANUAL' ? (
          <form onSubmit={handleManualSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] uppercase font-bold text-zinc-400 mb-1.5">Systolic</label>
                <input type="number" required value={systolic} onChange={e => setSystolic(e.target.value)} className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition-all font-semibold text-sm" placeholder="120" />
              </div>
              <div>
                <label className="block text-[10px] uppercase font-bold text-zinc-400 mb-1.5">Diastolic</label>
                <input type="number" required value={diastolic} onChange={e => setDiastolic(e.target.value)} className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition-all font-semibold text-sm" placeholder="80" />
              </div>
              <div>
                <label className="block text-[10px] uppercase font-bold text-zinc-400 mb-1.5">Heart Rate</label>
                <input type="number" required value={heartRate} onChange={e => setHeartRate(e.target.value)} className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition-all font-semibold text-sm" placeholder="72" />
              </div>
              <div>
                <label className="block text-[10px] uppercase font-bold text-zinc-400 mb-1.5">Glucose</label>
                <input type="number" value={glucose} onChange={e => setGlucose(e.target.value)} className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition-all font-semibold text-sm" placeholder="-" />
              </div>
              <div className="col-span-2">
                <label className="block text-[10px] uppercase font-bold text-zinc-400 mb-1.5">Temperature (°F)</label>
                <input type="number" step="0.1" value={temperature} onChange={e => setTemperature(e.target.value)} className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition-all font-semibold text-sm" placeholder="98.6" />
              </div>
            </div>
            <div>
              <label className="block text-[10px] uppercase font-bold text-zinc-400 mb-1.5">Notes</label>
              <textarea value={notes} onChange={e => setNotes(e.target.value)} className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition-all font-medium text-sm h-20 resize-none" placeholder="How are you feeling?" />
            </div>
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-red-600 text-white py-3 rounded-xl font-bold text-sm hover:bg-red-700 transition shadow-lg shadow-red-200 disabled:opacity-50 disabled:shadow-none"
            >
              {loading ? 'Analyzing...' : 'Log Vitals'}
            </button>
          </form>
        ) : (
          <div className="text-center py-12 border-2 border-dashed border-zinc-200 rounded-xl bg-zinc-50 hover:bg-white hover:border-red-200 transition-all cursor-pointer group relative">
             <input 
              type="file" 
              accept=".pdf,.csv,.png,.jpg"
              onChange={handleFileUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
            <div className="bg-white p-4 rounded-full shadow-sm border border-zinc-100 w-14 h-14 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
            </div>
            <p className="text-sm font-bold text-zinc-800">Upload Lab Report</p>
            <p className="text-xs text-zinc-400 mt-1">PDF, CSV, or Image</p>
            {loading && <p className="text-xs text-red-600 mt-3 font-medium animate-pulse">Processing...</p>}
          </div>
        )}
      </div>
    </div>
  );
};