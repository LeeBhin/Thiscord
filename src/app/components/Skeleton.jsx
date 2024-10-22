import React, { memo } from "react";
import styles from "../channels/me/[userId]/dm.module.css";

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const SkeletonMessage = memo(() => {
  const contentWrapCount = getRandomInt(1, 4);
  const picIncluded = Math.random() < 0.27;
  const picPosition = getRandomInt(0, contentWrapCount + 1);

  return (
    <div className={styles["sk-message"]}>
      <div className={styles["sk-profile"]} />

      <div className={styles["sk-infoWrap"]}>
        <div
          className={styles["sk-name"]}
          style={{ width: `${getRandomInt(100, 150)}px` }}
        />

        {picIncluded && picPosition === 0 && (
          <div
            className={styles["sk-pic"]}
            style={{ height: `${getRandomInt(80, 300)}px` }}
          />
        )}

        {[...Array(contentWrapCount)].map((_, wrapIndex) => (
          <div key={wrapIndex} className={styles["sk-wrapIndex"]}>
            <div className={styles["sk-contentWrap"]}>
              {[...Array(getRandomInt(1, 8))].map((_, contentIndex) => (
                <div
                  key={contentIndex}
                  className={styles["sk-content"]}
                  style={{ width: `${getRandomInt(40, 100)}px` }}
                />
              ))}
            </div>

            {picIncluded && picPosition === wrapIndex + 1 && (
              <div
                className={styles["sk-pic"]}
                style={{ height: `${getRandomInt(80, 300)}px` }}
              />
            )}
          </div>
        ))}

        {picIncluded && picPosition === contentWrapCount + 1 && (
          <div
            className={styles["sk-pic"]}
            style={{ height: `${getRandomInt(80, 300)}px` }}
          />
        )}
      </div>
    </div>
  );
});

SkeletonMessage.displayName = 'SkeletonMessage';

export default function Skeleton() {
  return (
    <div className={styles["sk-skeleton"]}>
      <div className={styles["sk-messages"]}>
        {[...Array(8)].map((_, index) => (
          <SkeletonMessage key={index} />
        ))}
      </div>
    </div>
  );
}
