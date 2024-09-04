import Head from 'next/head';
import styles from './friends.module.css';
import Images from '@/Images';

export default function Friends() {
  return (
    <div className={styles.friends}>
      <Head>
        <title>Thiscord | 친구</title>
      </Head>

      <header className={styles.header}>
        <div className={styles.headerWrap}>

          <div className={styles.frinedsTitle}>
            <div className={styles.friendSvg}>
              <Images.friends />
            </div>
            <div className={styles.friendsTxt}>친구</div>
          </div>

          <div className={styles.barricade} />

          <div className={styles.statusWrap}>
            <div className={`${styles.all} ${styles.statusActive}`}>
              모두
            </div>

            <div className={styles.ready}>
              대기 중
            </div>

            <div className={styles.ready}>
              추천
            </div>

            <div className={styles.ready}>
              친구 추가하기
            </div>

          </div>
        </div>
      </header >

      <div className={styles.body}>

      </div>
    </div >
  );
}
