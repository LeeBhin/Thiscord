'use client';

import Images from '@/Images'
import styles from '../friends.module.css'
import { useEffect, useState } from 'react';
import { load_friends } from '@/utils/api';

export default function All_Friends() {
    const [friends, setFriends] = useState([]);
    useEffect(() => {
        const loadFriends = async () => {
            try {
                const friends = await load_friends();
                setFriends(friends);
            } catch (error) {
                console.error('Failed to load friends:', error);
            }
        };

        loadFriends();
    }, []);

    return (
        <div>
            <div className={styles.searchFriend}>
                <input type="text" placeholder='검색하기' />
                <Images.search className={styles.searchIcon} />
            </div>

            <div className={styles.friendsWrap}>
                <p className={styles.countFriends}>{`모든 친구 – ${friends.length}명`}</p>

                <div className={styles.friendsList}>
                    {friends.length > 0 ? (
                        friends.map((friend, index) => (
                            <div key={index} className={styles.friend}>
                                <div
                                    className={styles.profile}
                                    style={{ backgroundColor: friend.iconColor }}
                                >
                                    <Images.icon className={styles.icon} />
                                </div>
                                <div className={styles.name}>{friend.name}</div>
                            </div>
                        ))
                    ) : (
                        <></>
                    )}
                </div>
            </div>
        </div>
    )
}