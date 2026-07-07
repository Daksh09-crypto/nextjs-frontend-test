"use client";
  
import { useState } from "react";
import styles from "../dashboard.module.css";
import toast from "react-hot-toast";
import Loading from "@/components/loading";
export default function MeaningPage() {
  const [word, setWord] = useState("");
  const [targetLang, setTargetLang] = useState("English");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  async function searchWord(e) {
    if (e) e.preventDefault();        
    if (!word.trim()) return;
                                                                        
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch("/api/dictionary", {
        method: "POST", 
        body: JSON.stringify({ 
          word: word.trim(),
          targetLanguage: targetLang 
        }),
        headers: { "content-type": "application/json" }    
      });

      const reply = await response.json();

      if (reply.success === false) {
        toast.error(reply.message || "Could not analyze text");
        return;
      }

      setResult(reply);
      toast.success("Analysis Complete!");
    } catch (error) {
      toast.error("Failed to run linguistic analysis");
    } finally {
      setLoading(false);
    }
  }

async function saveToVault() {
    if (!result) return;
    
    setLoading(true);
    try {
      const response = await fetch("/api/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ result }) // Pass the analyzed word dictionary object
      });

      const reply = await response.json();

      if (!response.ok || reply.success === false) {
        toast.error(reply.message || "Could not save to vault.");
        return;
      }

      toast.success("Saved to Vault securely! ⭐");
    } catch (err) {
      toast.error("Network error: Could not reach the data database storage.");
    } finally {
      setLoading(false);
    }
  }
  return (
    <main className={styles.main}>
      {loading&&<Loading/>}
     
    <div className={styles.page} disabled={loading} >
      {/* TITLE */}
      <h1 className={styles.title}>🌐 Universal Linguist Engine</h1>
      <p className={styles.subtitle}>
        Analyze words or full sentences instantly in English, Hindi, and Sanskrit
      </p>

      {/* SEARCH & LANGUAGE CONTROL */}
      <form onSubmit={searchWord} className={styles.searchBox}>
        <input
          value={word}
          onChange={(e) => setWord(e.target.value)}
          placeholder="Type a word or full sentence..."
        />
        <select 
          value={targetLang} 
          onChange={(e) => setTargetLang(e.target.value)}
          className={styles.langSelect}
        >
          <option value="English">Translate to English</option>
          <option value="Hindi">Translate to Hindi (हिंदी)</option>
          <option value="Sanskrit">Translate to Sanskrit (संस्कृतम्)</option>
        </select>                                          
        <button type="submit" disabled={loading}>
          {loading ? "Analyzing..." : "Analyze"}
        </button>
      </form>
                                   
      {/* RESULT CARD */}
      {result && (
        <div className={styles.resultCard}>
          
          {/* Header Row */}
          <div className={styles.cardHeader}>
            <h2 className={styles.wordTitle}>{result.word}</h2>
          </div>

          {/* Error Detection Box */}
          {result.errorAnalysis?.hasErrors && (
            <div className={styles.errorBox}>
              <span className={styles.errorBadge}>⚠️ Issue Detected</span>
              <p className={styles.errorText}><strong>Correction:</strong> {result.errorAnalysis.correction}</p>
              <p className={styles.errorText}><strong>Why:</strong> {result.errorAnalysis.explanation}</p>
            </div>
          )}

          {/* Tri-Lingual Pronunciation Section */}
          <div className={styles.pronounceRow}>
            <div className={styles.pronounceBox}>🗣️ <strong>EN:</strong> {result.pronunciations?.english}</div>
            <div className={styles.pronounceBox}>🗣️ <strong>HI:</strong> {result.pronunciations?.hindi}</div>
            <div className={styles.pronounceBox}>🗣️ <strong>SAN:</strong> {result.pronunciations?.sanskrit}</div>
          </div>

          {/* Grammar Insight Box */}
        {result.grammarSection && (
  <div className={styles.insightCard}>
    {/* Section Header */}
    <span className={styles.insightBadge}>🧠 Grammar & Structural Analysis</span>
    
    {/* 1. Core Grammar Insight */}
    {result.grammarSection.grammarInsight && (
      <p className={styles.insightText}>
        {result.grammarSection.grammarInsight}
      </p>
    )}

    {/* Divider if idioms or metaphors exist */}
    {(result.grammarSection.idiom || result.grammarSection.metaphor) && <hr className={styles.divider} />}
            
    {/* 2. Idiom Section */}
    {result.grammarSection.idiom?.expression && (
      <div className={styles.culturalItem}>
        <span className={styles.subBadge}>🗣️ Idiom / Proverb</span>
        <h4 className={styles.expressionTitle}>{result.grammarSection.idiom.expression}</h4>
        <p className={styles.expressionMeaning}>{result.grammarSection.idiom.meaning}</p>
      </div>
    )}

    {/* 3. Metaphor Section */}
    {result.grammarSection.metaphor?.expression && (
      <div className={styles.culturalItem}>
        <span className={styles.subBadge}>✨ Metaphorical Context</span>
        <h4 className={styles.expressionTitle}>{result.grammarSection.metaphor.expression}</h4>
        <p className={styles.expressionMeaning}>{result.grammarSection.metaphor.meaning}</p>
      </div>
    )}
  </div>
)}
               
          {/* Main Meaning Scope */}
          {result.meanings?.map((meaning, index) => (
            <div key={index} className={styles.meaningBlock}>
              <div className={styles.partOfSpeech}>{meaning.partOfSpeech}</div>    
              
              {meaning.definitions?.map((def, dIndex) => (
                <div key={dIndex} className={styles.definitionItem}>
                  <p className={styles.definitionText}>
                    <span className={styles.bulletPoint}>•</span>{def.definition}
                  </p>
                  
                  {def.easyExample && (
                    <p className={styles.exampleText}>
                      <span className={styles.exampleLabel}>Easy Example:</span> "{def.easyExample}"
                    </p>
                  )}
                  {def.advancedExample && (
                    <p className={styles.exampleText}>
                      <span className={styles.exampleLabel}>Advanced Example:</span> "{def.advancedExample}"
                    </p>
                  )}
                </div>
              ))}

              {/* Dynamic Easy vs Advanced Synonyms Layout */}
              {((meaning.synonyms?.easy?.length > 0) || (meaning.synonyms?.advanced?.length > 0)) && (
                <div className={styles.synonymsWrapper}>
                  {meaning.synonyms?.easy?.length > 0 && (
                    <div className={styles.synonymsContainer}>
                      <span className={styles.synonymsTitle}>EASY SYNONYMS:</span>
                      {meaning.synonyms.easy.slice(0, 4).map((syn, sIndex) => (
                        <span key={sIndex} className={styles.synonymBadge}>{syn}</span>
                      ))}
                    </div>
                  )}
                  {meaning.synonyms?.advanced?.length > 0 && (
                    <div className={styles.synonymsContainer}>
                      <span className={styles.synonymsTitle}>ADVANCED SYNONYMS:</span>
                      {meaning.synonyms.advanced.slice(0, 4).map((syn, sIndex) => (
                        <span key={sIndex} className={`${styles.synonymBadge} ${styles.advBadge}`}>{syn}</span>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}

          {/* Action Footer */}
          <div className={styles.cardFooter}>
            <button onClick={saveToVault} className={styles.saveBtn}>
              ⭐ Save to Vault
            </button>
          </div>
        </div>
      )}
    </div>
    </main>
  );
}