import { useState, useEffect, useRef } from 'react';
import styles from '../(no-layout)/register/register.module.css';
import { HiChevronDown } from "react-icons/hi";

export default function BirthDropdown() {
    const [isYearClicked, setIsYearClicked] = useState(false);
    const [isMonthClicked, setIsMonthClicked] = useState(false);
    const [isDayClicked, setIsDayClicked] = useState(false);

    const [year, setYear] = useState('');
    const [month, setMonth] = useState('');
    const [day, setDay] = useState('');

    const years = [];
    const currentYear = new Date().getFullYear();
    for (let year = currentYear - 3; year >= currentYear - 200; year--) {
        years.push(year);
    }

    const months = [];
    for (let month = 1; month <= 12; month++) {
        months.push(month);
    }

    const days = [];
    for (let day = 1; day <= 31; day++) {
        days.push(day);
    }

    const yearRef = useRef();
    const monthRef = useRef();
    const dayRef = useRef();

    const dropActive = (type) => {
        if (type === 'year') {
            setIsYearClicked(!isYearClicked);
            setIsMonthClicked(false);
            setIsDayClicked(false);
        } else if (type === 'month') {
            setIsMonthClicked(!isMonthClicked);
            setIsYearClicked(false);
            setIsDayClicked(false);
        } else {
            setIsDayClicked(!isDayClicked);
            setIsMonthClicked(false);
            setIsYearClicked(false);
        }
    }

    const insertInput = (type, val) => {
        if (type === 'y') {
            setYear(val);
            setIsYearClicked(false);
        } else if (type === 'm') {
            setMonth(`${val}월`);
            setIsMonthClicked(false);
        } else if (type === 'd') {
            setDay(val);
            setIsDayClicked(false);
        }
    }

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                yearRef.current && !yearRef.current.contains(event.target) &&
                monthRef.current && !monthRef.current.contains(event.target) &&
                dayRef.current && !dayRef.current.contains(event.target)
            ) {
                setIsYearClicked(false);
                setIsMonthClicked(false);
                setIsDayClicked(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <div className={styles.birthWrap}>
            <div className={styles.dropWrap} onClick={() => dropActive('year')} ref={yearRef}>
                {
                    isYearClicked && <div className={styles.selectorWrap}>
                        {years.map((year) => (
                            <div key={year} className={styles.selectElement} onClick={() => insertInput('y', year)}>
                                {year}
                            </div>
                        ))}
                    </div>
                }
                <input
                    type="text"
                    className={styles.birth}
                    placeholder="년"
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                />
                <div className={styles.dropBtn}><HiChevronDown className={styles.downSVG} /></div>
            </div>

            <div className={styles.dropWrap} onClick={() => dropActive('month')} ref={monthRef}>
                {
                    isMonthClicked &&
                    <div className={styles.selectorWrap}>
                        {months.map((month) => (
                            <div key={month} className={styles.selectElement} onClick={() => insertInput('m', month)}>
                                {month}월
                            </div>
                        ))}
                    </div>
                }
                <input
                    type="text"
                    className={styles.birth}
                    placeholder="월"
                    value={month}
                    onChange={(e) => setMonth(e.target.value)}
                />
                <div className={styles.dropBtn}><HiChevronDown className={styles.downSVG} /></div>
            </div>

            <div className={styles.dropWrap} onClick={() => dropActive('day')} ref={dayRef}>
                {
                    isDayClicked &&
                    <div className={styles.selectorWrap}>
                        {days.map((day) => (
                            <div key={day} className={styles.selectElement} onClick={() => insertInput('d', day)}>
                                {day}
                            </div>
                        ))}
                    </div>
                }
                <input
                    type="text"
                    className={styles.birth}
                    placeholder="일"
                    value={day}
                    onChange={(e) => setDay(e.target.value)}
                />
                <div className={styles.dropBtn}><HiChevronDown className={styles.downSVG} /></div>
            </div>
        </div>
    );
}