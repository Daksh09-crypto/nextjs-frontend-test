"use client";

import { useEffect, useState } from "react";
import styles from "../dashboard.module.css";
import Loading from "@/components/loading";
import toast from "react-hot-toast";

export default function VaultPage() {
  const [words, setWords] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // 1. Fetch authenticated words matching user ID on component mount
  useEffect(() => {
    async function fetchVaultData() {
      try {
        const response = await fetch("/api/save");
        const data = await response.json();

        if (response.status === 401 || response.status === 403) {
          toast.error("Session expired or invalid. Please sign in again. 🔒");
          return;
        }

        if (data.success) {
          setWords(data.vault || []);
        } else {
          toast.error(data.message || "Failed gathering vault database resources.");
        }
      } catch (err) {
        toast.error("Network error connecting to vocabulary backend server.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchVaultData();
  }, []);

  // 2. Updated removal function targeting MongoDB native ObjectId values
  async function removeWord(wordId, targetWordText) {
    if (!wordId) {
      toast.error("Cannot remove structural entry without valid identification parameters.");
      return;
    }

    const securePromise = async () => {
      const response = await fetch(`/api/save?id=${wordId}`, {
        method: "DELETE",
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed discarding file payload.");
      }

      // Optimistically clean state tracking layers matching local interface arrays
      setWords((prevWords) => prevWords.filter((item) => item._id !== wordId));
      return data;
    };

    toast.promise(securePromise(), {
      loading: `Deleting "${targetWordText}"...`,
      success: <b>Removed from your vault! 🗑️</b>,
      error: <b>Could not purge item.</b>,
    });
  }

  return (
    <div className={styles.page}>
      {isLoading && <Loading />}
      <h1 className={styles.title}>📦 Your Vault</h1>
      <p className={styles.subtitle}>Saved words you want to remember</p>

      {words.length === 0 && !isLoading ? (
        <div className={styles.empty}>No words saved yet 😴</div>
      ) : (
        <div className={styles.vaultList}>
          {words.map((item) => (
            // Use the native MongoDB unique identifier as your element tracking key
            <div key={item._id} className={styles.vaultCard}>
              <div className={styles.cardHeader}>
                <h2>{item.word}</h2>
                <button
                  onClick={() => removeWord(item._id, item.word)}
                  className={styles.deleteBtn}
                >
                  Delete
                </button>
              </div>

              {/* Loop through meanings array from your backend object mapping schema */}
              {item.meanings?.map((m, mIdx) => (
                <div key={mIdx} className={styles.meaningBlock}>
                  <span className={styles.posBadge}>{m.partOfSpeech}</span>

                  {m.definitions?.map((d, dIdx) => (
                    <p key={dIdx} className={styles.definitionText}>
                      • {d.definition}
                    </p>
                  ))}

                  {/* Render Synonyms cleanly */}
                  {m.synonyms && (
                    <div className={styles.synonymSection}>
                      <strong>Synonyms: </strong>
                      <span className={styles.easySyns}>
                        {m.synonyms.easy?.join(", ")}
                      </span>
                      {m.synonyms.advanced?.length > 0 && (
                        <span className={styles.advancedSyns}>
                          , {m.synonyms.advanced?.join(", ")}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}