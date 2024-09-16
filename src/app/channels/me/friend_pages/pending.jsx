'use client';

import Images from '@/Images'
import styles from '../friends.module.css'
import { useEffect, useState } from 'react';
import { pending_friends } from '@/utils/api';

export default function Pending() {
    const [friends, setFriends] = useState([]);
    useEffect(() => {
        const pendingFriends = async () => {
            try {
                const friends = await pending_friends();
                setFriends(friends);
            } catch (error) {
                console.error('Failed to load friends:', error);
            }
        };

        pendingFriends();
    }, []);

    return (
        <div>
            <div className={styles.searchFriend}>
                <input type="text" placeholder='검색하기' />
                <Images.search className={styles.searchIcon} />
            </div>

            <div className={styles.friendsWrap}>
                <p className={styles.countFriends}>{`대기 중 – ${friends.length}명`}</p>

                <div className={styles.friendsList}>
                    {friends.length > 0 ? (
                        friends.map((friend, index) => (
                            <div key={index} className={`${styles.friend} ${styles.friendPending}`}>
                                <div className={styles.profileWrap}>
                                    <div
                                        className={styles.profile}
                                        style={{ backgroundColor: friend.iconColor }}
                                    >
                                        <Images.icon className={styles.icon} />
                                    </div>
                                    <div className={styles.nameWrap}>
                                        <div className={styles.name}>{friend.name}</div>
                                        <div className={styles.pending}>{friend.name === friend.who ? ('받은 친구 요청') : ('보낸 친구 요청')}</div>
                                    </div>
                                </div>

                                <div className={styles.ox}>
                                    {friend.name === friend.who ? (<div className={styles.accept} ><Images.accept /></div>) : (<></>)}
                                    <div className={styles.deny} ><Images.deny /></div>
                                </div>
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