import { FC, useEffect, useState } from "react";
import styles from "./answer.module.css";

interface Props {
  text: string;
}

export const Answer: FC<Props> = ({ text }) => {
  const [sentences, setSentences] = useState<string[]>([]);

  useEffect(() => {
    // Split the text by periods and then filter out any empty strings
    setSentences(text.split(".").filter((sentence) => sentence.trim() !== ""));
  }, [text]);

  return (
    <ul>
      {sentences.map((sentence, index) => (
        <li
          key={index}
          className={`${styles.fadeIn} ${styles.listItem}`}
          style={{ animationDelay: `${index * 0.1}s` }}
        >
          {sentence.trim()}.
        </li>
      ))}
    </ul>
  );
};
