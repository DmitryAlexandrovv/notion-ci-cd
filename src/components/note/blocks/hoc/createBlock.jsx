import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useDrop } from 'react-dnd';
import { NOTE_MODE_TYPES } from '../../../../constants';
import OutsideClickHandler from 'react-outside-click-handler';
import { canDragNote, updateAddedBlocksIds } from '../../../../store/actions';

import styles from '../style.module.css';
import { CONTENT_TYPES } from '../../note-view-mode/constants';

const CreateBlock = (WrappedComponent) => {
    return function WithWrapper(props) {
        const activeMode = useSelector((state) => state.activeMode),
            addedBlocksIds = useSelector((state) => state.addedBlocksIds),
            [isCtrlGroupVisible, toggleCtrlGroupVisibility] = useState(false),
            [isEdit, toggleEdit] = useState(false),
            [data, setData] = useState(props.block.data),
            [error, setError] = useState(false),
            dispatch = useDispatch();

        useEffect(() => {
            toggleEdit(addedBlocksIds.indexOf(props.block.id) !== -1);
        }, [addedBlocksIds]);

        const [, drop] = useDrop(
            () => ({
                accept: [CONTENT_TYPES.TEXT, CONTENT_TYPES.IMAGE, CONTENT_TYPES.VIDEO, CONTENT_TYPES.LINK_TO_NOTE],
                drop: (item) => props.addBlock(props.block.id, item),
            }),
            [props.block]
        );

        const outsideClickHandler = (event) => {
            if (isEdit) {
                if (error) {
                    onCancel();
                } else {
                    if (props.block.type === CONTENT_TYPES.LINK_TO_NOTE) {
                        if (!event.target.closest('.ant-select-dropdown')) {
                            onSave(props.block.type, data);
                        }
                    } else {
                        onSave(props.block.type, data);
                    }
                }
            }
        };

        const onSave = (type, blockData) => {
            toggleEdit(false);
            dispatch(canDragNote(true));
            if (addedBlocksIds.indexOf(props.block.id) !== -1) {
                dispatch(updateAddedBlocksIds([...addedBlocksIds].filter((id) => id !== props.block.id)));
            }
            props.onChange(type, props.block.id, blockData);
        };

        const onCancel = () => {
            toggleEdit(false);
            dispatch(canDragNote(true));

            if (error && addedBlocksIds.indexOf(props.block.id) !== -1) {
                deleteCurrentBlock();
            } else {
                setData(props.block.data);
            }
        };

        const onStartEditing = () => {
            toggleEdit(true);
            dispatch(canDragNote(false));
        };

        const deleteCurrentBlock = () => {
            props.deleteBlock(props.block.id);
        };

        return (
            <div ref={drop} className={styles.blockDropPanel}>
                <div
                    className={styles.block}
                    onMouseEnter={() => toggleCtrlGroupVisibility(true)}
                    onMouseLeave={() => toggleCtrlGroupVisibility(false)}
                >
                    <OutsideClickHandler onOutsideClick={outsideClickHandler}>
                        <div className={styles.blockCtrlGroupPositioner}>
                            {isCtrlGroupVisible && activeMode === NOTE_MODE_TYPES.EDIT && !isEdit && (
                                <div className={styles.blockCtrlGroupWrapper}>
                                    <div className={styles.blockCtrlGroup}>
                                        <DeleteOutlined
                                            className={styles.blockCtrlGroupItem}
                                            onClick={deleteCurrentBlock}
                                        />
                                        <EditOutlined className={styles.blockCtrlGroupItem} onClick={onStartEditing} />
                                    </div>
                                </div>
                            )}
                            <WrappedComponent
                                {...props}
                                isEditMode={activeMode === NOTE_MODE_TYPES.EDIT && isEdit}
                                toggleCtrlGroupVisibility={toggleCtrlGroupVisibility}
                                onSave={onSave}
                                onCancel={onCancel}
                                data={data}
                                setData={setData}
                                error={error}
                                setError={setError}
                            />
                        </div>
                    </OutsideClickHandler>
                </div>
            </div>
        );
    };
};

export default CreateBlock;
