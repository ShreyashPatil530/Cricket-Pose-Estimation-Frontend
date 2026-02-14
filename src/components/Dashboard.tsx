import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Upload, BarChart3, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
const API_BASE = `${BACKEND_URL}/api/analysis`;

const Dashboard = () => {
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [analysisId, setAnalysisId] = useState<string | null>(null);
    const [analysisData, setAnalysisData] = useState<any>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) setFile(e.target.files[0]);
    };

    const handleUpload = async () => {
        if (!file) return;
        setLoading(true);
        const formData = new FormData();
        formData.append('video', file);

        try {
            setAnalysisData(null); // Clear previous data
            setAnalysisId(null);
            const res = await axios.post(`${API_BASE}/upload`, formData);
            setAnalysisId(res.data.analysisId);
        } catch (err) {
            console.error(err);
            alert('Upload failed');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!analysisId) return;
        if (analysisData && (analysisData.status === 'completed' || analysisData.status === 'failed')) return;

        const interval = setInterval(async () => {
            try {
                const res = await axios.get(`${API_BASE}/${analysisId}`);
                setAnalysisData(res.data);
                if (res.data.status === 'completed' || res.data.status === 'failed') {
                    clearInterval(interval);
                }
            } catch (err) {
                console.error(err);
            }
        }, 3000);

        return () => clearInterval(interval);
    }, [analysisId, analysisData]);

    return (
        <div className="min-h-screen p-8 max-w-7xl mx-auto">
            <header className="mb-12">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                    Cricket Biomechanics Pro
                </h1>
                <p className="text-zinc-400 mt-2">AI-Powered Pose Estimation & Insight Report</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Upload Card */}
                <div className="lg:col-span-1 glass-morphism rounded-2xl p-6 h-fit">
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        <Upload size={20} className="text-emerald-400" /> Upload Session
                    </h2>
                    <div className="border-2 border-dashed border-white/10 rounded-xl p-8 text-center hover:border-emerald-500/50 transition-colors">
                        <input
                            type="file"
                            accept="video/*"
                            onChange={handleFileChange}
                            className="hidden"
                            id="video-upload"
                        />
                        <label htmlFor="video-upload" className="cursor-pointer">
                            <div className="bg-emerald-500/10 p-4 rounded-full w-fit mx-auto mb-4">
                                <Upload size={32} className="text-emerald-500" />
                            </div>
                            <p className="text-sm text-zinc-300">
                                {file ? file.name : "Click to upload batting video"}
                            </p>
                        </label>
                    </div>
                    <button
                        disabled={!file || loading}
                        onClick={handleUpload}
                        className="btn-primary w-full mt-6"
                    >
                        {loading ? "Uploading..." : "Run Analysis"}
                    </button>
                </div>

                {/* Status & Results */}
                <div className="lg:col-span-2 space-y-8">
                    {analysisData && (
                        <AnimatePresence>
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="glass-morphism rounded-2xl p-8"
                            >
                                <div className="flex items-center justify-between mb-8">
                                    <h2 className="text-2xl font-bold">Analysis Status</h2>
                                    <div className={`px-4 py-2 rounded-full text-sm flex items-center gap-2 ${analysisData.status === 'completed' ? 'bg-emerald-500/20 text-emerald-400' :
                                        analysisData.status === 'processing' ? 'bg-amber-500/20 text-amber-400' : 'bg-zinc-800'
                                        }`}>
                                        {analysisData.status === 'processing' && <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />}
                                        {analysisData.status && (analysisData.status.charAt(0).toUpperCase() + analysisData.status.slice(1))}
                                    </div>
                                </div>

                                {analysisData.status === 'completed' && (
                                    <div className="space-y-8">
                                        <div className="aspect-video bg-black rounded-xl overflow-hidden border border-white/10">
                                            <video
                                                src={`${BACKEND_URL}/public/processed/processed_${analysisData.fileName}.mp4`}
                                                controls
                                                className="w-full h-full object-contain"
                                            />
                                        </div>

                                        <div className="border-t border-white/10 pt-8">
                                            <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-emerald-400">
                                                <Info size={20} /> AI Biomechanical Report
                                            </h3>
                                            <div className="prose prose-invert max-w-none text-zinc-300 whitespace-pre-line bg-white/5 p-6 rounded-xl">
                                                {analysisData.aiReport}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        </AnimatePresence>
                    )}

                    {!analysisData && (
                        <div className="h-full flex flex-col items-center justify-center text-zinc-500 opacity-50">
                            <BarChart3 size={64} className="mb-4" />
                            <p>Upload a video to see real-time pose analysis and AI coaching reports</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
