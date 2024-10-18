import styles from "./skeleton.module.css";

export default function Skeleton() {
  return (
    <div className={styles.skeleton}>
      <div className={styles.messages}>
        <div className={styles.message}>
          <div className={styles.profile} />

          <div className={styles.infoWrap}>
            <div className={styles.name} />
            <div className={styles.contentWrap}>
              <div className={styles.content} />
              <div className={styles.content} />
              <div className={styles.content} />
            </div>
            <div className={styles.contentWrap}>
              <div className={styles.content} />
              <div className={styles.content} />
              <div className={styles.content} />
            </div>
            <dv className={styles.pic} />
          </div>
        </div>
      </div>
    </div>
  );
}
