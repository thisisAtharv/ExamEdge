import React, { useState, useMemo } from 'react';
import { ArrowLeft, Clock, Book, Landmark, Globe, Scale, Cpu, FileText, Volume2 } from 'lucide-react';
import localResources from '../data/resources.json';
import * as pdfjsLib from 'pdfjs-dist';
import { GlobalWorkerOptions } from 'pdfjs-dist';
import PDFWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?worker';

GlobalWorkerOptions.workerPort = new PDFWorker();

const SUBJECTS_DATA = {
  "Economics": { icon: <Landmark size={32} className="text-purple-600" />, subsections: ["Advanced Macroeconomics", "Advanced Microeconomics", "Basic Macroeconomics", "Economic Planning In India", "Economics Of Growth And Development- I", "Economics Of Growth And Development - II", "Environment Economics", "Fundamentals Of Microeconomic Theory", "International Economics", "Money And Banking", "Public Finance And Policy In India", "Quantitative Methods I (Mathematical Methods)", "Quantitative Methods II (Statistical Methods)", "Sectoral Growth In India", "Theory Of Public Finance"] },
  "Geography": { icon: <Globe size={32} className="text-purple-600" />, subsections: ["Quantitative Technique", "Resource Geography", "Geographical thought", "EnvironmentalGeography", "Urban Geography", "RemoteSensing,GISandGPS", "Geomorphology", "Climatology", "Geography of Natural Hazards and Disaster Management", "Geography Of Water Resources"] },
  "Political Science": { icon: <FileText size={32} className="text-purple-600" />, subsections: ["Indian Politics - I", "Indian Politics - II", "Comparative Politics", "International Relations Theory and Politics", "Public Policy, Governance and Indian Administration", "Foreign policy of India", "Political Theory and Thought Western and Indian Traditions"] },
  "Legal Studies": {
    icon: <Scale size={32} className="text-purple-600" />, subsections: [
      "Access To Justice",
      "Advanced Constitution Law",
      "Advanced Jurisprudence",
      "Comparative Constitutional Law",
      "Competiton Law",
      "Corporate Law",
      "Criminal Justice Administration",
      "Environmental Law",
      "Information & Communication Technology",
      "Intellactual Property",
      "International Human Rights Law",
      "International Trade Law",
      "Judicial Process and Administration",
      "Research Methodology",
      "Substantive Criminal Law"
    ]
  },
  "Electronic Science": { icon: <Cpu size={32} className="text-purple-600" />, subsections: ["Communication System", "Digital Electronics- I", "Digital Electronics-II", "C & C++ Programming", "Electrodynamics & Microwaves", "Microprocessors & Microcontrollers", "Optoelectronics", "Power Electronics", "VHDL and Verilog- Testing and Verification"] },
  "Automated Library": { icon: <Book size={32} className="text-purple-600" />, subsections: [] }
};

function formatResourceTitle(title) {
  return title.replace(/M[\s-]?\d+\s?_?/i, '').trim();
}

function StudyResourcesPage() {
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [readingState, setReadingState] = useState({ isReading: false, resourceId: null });

  const filteredResources = useMemo(() => {
    if (!selectedSubject || !selectedTopic) return [];
    return localResources.filter(
      resource => resource.subject === selectedSubject && resource.topic === selectedTopic
    );
  }, [selectedSubject, selectedTopic]);

  const recommendedResources = useMemo(() => {
    const shuffled = [...localResources].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 2);
  }, []);

  const testAutomationPdfCount = useMemo(() => {
    return localResources.filter(r => r.subject === "Automated Library").length;
  }, []);

  const extractTextFromPDF = async (url) => {
    try {
      const pdf = await pdfjsLib.getDocument(url).promise;
      let fullText = '';
      for (let pageNum = 3; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map(item => item.str).join(' ');
        fullText += pageText + '\n\n';
      }
      const cleanedText = fullText.replace(/_{3,}/g, ' ');
      return cleanedText;
    } catch (error) {
      console.error("Error extracting text from PDF:", error);
      alert("Could not read the PDF file.");
      return null;
    }
  };

  const handleReadAloud = async (resource) => {
    if (!('speechSynthesis' in window)) {
      alert("Sorry, your browser does not support text-to-speech.");
      return;
    }

    if (readingState.isReading && readingState.resourceId === resource.id) {
      window.speechSynthesis.cancel();
      return setReadingState({ isReading: false, resourceId: null });
    }

    window.speechSynthesis.cancel();
    setReadingState({ isReading: true, resourceId: resource.id });

    const textToRead = await extractTextFromPDF(resource.url);

    if (textToRead && 'speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(textToRead);
      const voices = window.speechSynthesis.getVoices();
      const britishVoice = voices.find(voice => voice.lang === 'en-GB' && voice.name.includes('Female'));
      if (britishVoice) {
        utterance.voice = britishVoice;
        console.log("Using voice:", britishVoice.name);
      } else {
        console.log("British female voice not found, using default.");
      }
      utterance.rate = 0.9;
      utterance.onend = () => setReadingState({ isReading: false, resourceId: null });
      utterance.onerror = (event) => {
        console.error("Speech synthesis error:", event);
        // alert("Error during speech playback.");
        setReadingState({ isReading: false, resourceId: null });
      };
      window.speechSynthesis.speak(utterance);
    } else {
      setReadingState({ isReading: false, resourceId: null }); // Reset state if text extraction failed
    }
  };

  const handleSubjectClick = (subject) => {
    if (subject === "Automated Library") {
      setSelectedSubject("Automated Library");
      setSelectedTopic("General"); // Auto-select the "General" topic
    } else {
      setSelectedSubject(subject);
    }
  };

  const handleBack = () => {
    if (selectedTopic) {
      setSelectedTopic(null);
      // If we are backing out of the special automation subject, go all the way home
      if (selectedSubject === "Automated Library") {
        setSelectedSubject(null);
      }
    } else if (selectedSubject) {
      setSelectedSubject(null);
    }
  };

  let currentView;
  if (!selectedSubject) {
    // Show Subjects View
    currentView = (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {Object.entries(SUBJECTS_DATA).map(([subject, data]) => {
          // --- FIX for "0 topics" ---
          const isTestAutomation = subject === "Automated Library";
          const count = isTestAutomation ? testAutomationPdfCount : data.subsections.length;
          const label = isTestAutomation ? (count === 1 ? "PDF" : "PDFs") : (count === 1 ? "topic" : "topics");

          return (
            <button key={subject} onClick={() => handleSubjectClick(subject)} className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl hover:-translate-y-1 transition-all text-left group">
              <div className="bg-purple-100 p-3 rounded-full w-max mb-4">{data.icon}</div>
              <h3 className="text-xl font-bold text-gray-800 group-hover:text-purple-600">{subject}</h3>
              <p className="text-gray-500 text-sm">{count} {label}</p>
            </button>
          );
        })}
      </div>
    );
  } else if (!selectedTopic) {
    // Show Topics (Subsections) View
    currentView = (
      <div className="space-y-4">
        {SUBJECTS_DATA[selectedSubject]?.subsections.map((topic) => (
          <button key={topic} onClick={() => setSelectedTopic(topic)} className="w-full bg-white p-4 rounded-lg shadow-md hover:shadow-lg hover:bg-purple-50 transition-all text-left flex justify-between items-center">
            <h3 className="font-semibold text-gray-700">{topic}</h3>
            <span className="text-purple-600 text-xs font-bold">VIEW FILES ▸</span>
          </button>
        ))}
      </div>
    );
  } else {
    // Show PDFs View
    currentView = (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredResources.map((resource) => (
          <div key={resource.id} className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl hover:-translate-y-1 transition-all flex flex-col group">
            <div className="flex-grow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <FileText className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">Notes</span>
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700 ml-1">Medium</span>
                  </div>
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2 group-hover:text-purple-600 transition-colors">
                {formatResourceTitle(resource.title)}
              </h3>
              <p className="text-sm text-gray-500 mb-4">{resource.subject}</p>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-1"><Clock className="w-4 h-4" /><span>{resource.duration}</span></div>
              </div>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-2">
              <a href={resource.url} target="_blank" rel="noopener noreferrer" className="w-full block text-center bg-purple-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-purple-700">
                View PDF
              </a>
              <button
                onClick={() => handleReadAloud(resource)}
                disabled={readingState.isReading && readingState.resourceId !== resource.id}
                className="w-full flex items-center justify-center gap-2 text-center bg-gray-200 text-gray-700 font-semibold py-2 px-4 rounded-lg hover:bg-gray-300 disabled:opacity-50"
              >
                <Volume2 className="w-4 h-4" />
                {readingState.isReading && readingState.resourceId === resource.id ? 'Stop' : 'Read'}
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header and Breadcrumb */}
      <div>
        {selectedSubject && (
          <button onClick={handleBack} className="flex items-center gap-1 text-sm font-medium text-gray-500 hover:text-purple-700 mb-4">
            <ArrowLeft size={16} /> Back
          </button>
        )}
        <h1 className="text-3xl font-bold text-gray-800">
          {selectedTopic || selectedSubject || "Study Resources"}
        </h1>
        <p className="text-gray-600 mt-1">
          {selectedTopic ? `${filteredResources.length} PDF(s) for ${selectedTopic}` : selectedSubject ? `${SUBJECTS_DATA[selectedSubject].subsections.length} Topics in ${selectedSubject}` : "Access curated study materials, notes, and resources for UPSC preparation"}
        </p>
      </div>

      {currentView}
      {/* --- NEW: Recommended for You Section --- */}
      {/* This section only shows on the main subject selection screen */}
      {!selectedSubject && (
        <div className="bg-white p-8 rounded-lg shadow-md mt-12 transition-transform duration-300 hover:-translate-y-1 shadow-sm hover:shadow">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">📚 Recommended for You</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recommendedResources.map(resource => (
              <a href={resource.url} target="_blank" rel="noopener noreferrer" key={resource.id} className="block p-4 bg-purple-50 border border-purple-200 rounded-lg hover:shadow-lg hover:border-purple-300 transition-all">
                <div className="flex items-center gap-3 mb-2">
                  <FileText className="w-5 h-5 text-purple-700" />
                  <h3 className="font-semibold text-purple-800 mb-1">{resource.title}</h3>
                </div>
                {/* <FileText className="w-5 h-5 text-primary" />
                <h3 className="font-semibold text-purple-800 mb-1">{resource.title}</h3> */}
                <p className="text-sm text-gray-600 mb-2">Comprehensive notes covering {resource.topic}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-purple-700 font-medium">{resource.subject} • {resource.duration}</span>
                  <span className="text-sm text-purple-700 hover:text-purple-800 font-medium">View →</span>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default StudyResourcesPage;