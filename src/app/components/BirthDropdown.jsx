import styles from '@/app/register/register.module.css';

import { BiChevronDown } from "react-icons/bi";

export default function BirthDropdown() {
    const years = [];
    const currentYear = new Date().getFullYear();
    for (let year = currentYear; year >= currentYear - 200; year--) {
        years.push(year);
    }

    const months = [];
    for (let month = 1; month <= 12; month++) {
        months.push(`${month}월`);
    }

    const days = [];
    for (let day = 1; day <= 31; day++) {
        days.push(day);
    }

    return (
        <div className={styles.birthWrap}>
            <div className={styles.dropWrap}>
                <input
                    type="text"
                    className={styles.birth}
                    placeholder="년"
                />
                <dvi className={styles.dropBtn}><BiChevronDown className={styles.downSVG} /></dvi>
            </div>

            <div className={styles.dropWrap}>
                <input
                    type="text"
                    className={styles.birth}
                    placeholder="월"
                />
                <dvi className={styles.dropBtn}><BiChevronDown className={styles.downSVG} /></dvi>
            </div>

            <div className={styles.dropWrap}>
                <input
                    type="text"
                    className={styles.birth}
                    placeholder="일"
                />
                <dvi className={styles.dropBtn}><BiChevronDown className={styles.downSVG} /></dvi>
            </div>

        </div>
    );
}
