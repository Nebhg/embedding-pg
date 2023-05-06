import { FC, useEffect, useState } from "react";
import styles from "./answer.module.css";

interface Props {
  text: string;
}

export const Answer: FC<Props> = ({ text }) => {
  const [sections, setSections] = useState<any[]>([]);

  useEffect(() => {
    const ingredients = text.match(/Ingredients:(.+?)Instructions:/s);
    const instructions = text.match(/Instructions:(.+?)Nutrition:/s);
    const nutrition = text.match(/Nutrition:(.+)/s);

    if (ingredients && instructions && nutrition) {
      const ingredientsList = ingredients[1]
        .trim()
        .split(", ")
        .filter((ingredient: string) => ingredient.trim() !== "");

      const instructionsList = instructions[1]
        .trim()
        .split(/(?<![0-9])\./)
        .filter((instruction: string) => instruction.trim() !== "");

      const nutritionList = nutrition[1]
        .trim()
        .split(", ")
        .filter((nutrient: string) => nutrient.trim() !== "");

      setSections([
        { title: "Ingredients", list: ingredientsList },
        { title: "Instructions", list: instructionsList },
        { title: "Nutrition", list: nutritionList },
      ]);
    }
  }, [text]);

  return (
    <div>
      {sections.map((section, index) => (
        <div key={index} className={`${styles.fadeIn}`} style={{ animationDelay: `${index * 0.2}s` }}>
          <h4>{section.title}</h4>
          <ul>
            {section.list.map((item: string, idx: number) => (
              <li key={idx} className={`${styles.listItem}`}>
                {item.trim()}
                {section.title === "Instructions" && "."}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};
