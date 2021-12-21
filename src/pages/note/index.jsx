import { useSelector, useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import firebaseService from '../../service/firebase';
import { findPageIdByUrl } from '../../helpers';
import { NOTE_MODE_TYPES } from '../../constants';
import Sidebar from '../../components/sidebar';
import NoteViewMode from './view-mode';
import NoteEditMode from './edit-mode';
import NoteControlElements from './edit-mode/note-control-elements';
import Navbar from '../../components/navbar';
import { Button } from 'antd';
import { changeNoteMode } from '../../store/actions';

import pageStyles from '../style.module.css';
import styles from './style.module.css';

const Note = () => {
    const user = useSelector((state) => state.user),
        pages = useSelector((state) => state.pages),
        activeMode = useSelector((state) => state.activeMode),
        [activeNote, setActiveNote] = useState(null),
        { url: noteUrl } = useParams(),
        pageId = pages[noteUrl] ? noteUrl : findPageIdByUrl(pages, noteUrl),
        dispatch = useDispatch();

    useEffect(() => {
        firebaseService.getNoteBlocks(user.id, pageId).then((res) => {
            const blocks = res === null ? [] : res;

            const page = pages[pageId];

            setActiveNote({
                ...page,
                blocks,
            });
        });
    }, [noteUrl]);

    useEffect(() => {
        return () => {
            dispatch(changeNoteMode(NOTE_MODE_TYPES.VIEW));
        };
    }, [activeNote]);

    const tabToggleHandler = (activeKey) => {
        //ToDo может стоит сообщать пользаку, что изменения не сохраняться?(Если не нажал сохранить)
        dispatch(changeNoteMode(activeKey));
    };

    return (
        <div className={pageStyles.wrapper}>
            <Navbar />
            <div className={pageStyles.layout}>
                <Sidebar />
                <main className={pageStyles.main}>
                    {activeNote && (
                        <>
                            <div className={styles.noteCtrlGroup}>
                                <Button
                                    className={styles.noteCtrlGroupItem}
                                    onClick={() => tabToggleHandler(NOTE_MODE_TYPES.VIEW)}
                                >
                                    Просмотр
                                </Button>
                                <Button
                                    className={styles.noteCtrlGroupItem}
                                    onClick={() => tabToggleHandler(NOTE_MODE_TYPES.EDIT)}
                                >
                                    Редактирование
                                </Button>
                            </div>
                            {activeMode === NOTE_MODE_TYPES.VIEW && activeNote && (
                                <NoteViewMode activeNote={activeNote} />
                            )}
                            {activeMode === NOTE_MODE_TYPES.EDIT && activeNote && (
                                <NoteEditMode
                                    pageId={pageId}
                                    activeNote={activeNote}
                                    activeMode={activeMode}
                                    setactiveNote={setActiveNote}
                                />
                            )}
                        </>
                    )}
                </main>
                {activeMode === NOTE_MODE_TYPES.EDIT && activeNote && (
                    <NoteControlElements pageId={pageId} activeNote={activeNote} setActiveNote={setActiveNote} />
                )}
            </div>
        </div>
    );
};

export default Note;