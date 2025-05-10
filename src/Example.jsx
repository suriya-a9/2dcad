import { Stage, Layer, Text, Transformer } from 'react-konva';
import { Html } from 'react-konva-utils';
import { useEffect, useRef, useState, useCallback } from 'react';

Konva._fixTextRendering = true;

const TextEditor = ({ textNode, onClose, onChange }) => {
    const textareaRef = useRef(null);

    useEffect(() => {
        if (!textareaRef.current) return;

        const textarea = textareaRef.current;
        const stage = textNode.getStage();
        const textPosition = textNode.position();
        const stageBox = stage.container().getBoundingClientRect();
        const areaPosition = {
            x: textPosition.x,
            y: textPosition.y,
        };


        textarea.value = textNode.text();
        textarea.style.position = 'absolute';
        textarea.style.top = `${areaPosition.y}px`;
        textarea.style.left = `${areaPosition.x}px`;
        textarea.style.width = `${textNode.width() - textNode.padding() * 2}px`;
        textarea.style.height = `${textNode.height() - textNode.padding() * 2 + 5}px`;
        textarea.style.fontSize = `${textNode.fontSize()}px`;
        textarea.style.border = 'none';
        textarea.style.padding = '0px';
        textarea.style.margin = '0px';
        textarea.style.overflow = 'hidden';
        textarea.style.background = 'none';
        textarea.style.outline = 'none';
        textarea.style.resize = 'none';
        textarea.style.lineHeight = textNode.lineHeight();
        textarea.style.fontFamily = textNode.fontFamily();
        textarea.style.transformOrigin = 'left top';
        textarea.style.textAlign = textNode.align();
        textarea.style.color = textNode.fill();

        const rotation = textNode.rotation();
        let transform = '';
        if (rotation) {
            transform += `rotateZ(${rotation}deg)`;
        }
        textarea.style.transform = transform;

        textarea.style.height = 'auto';
        textarea.style.height = `${textarea.scrollHeight + 3}px`;

        textarea.focus();

        const handleOutsideClick = (e) => {
            if (e.target !== textarea) {
                onChange(textarea.value);
                onClose();
            }
        };


        const handleKeyDown = (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                onChange(textarea.value);
                onClose();
            }
            if (e.key === 'Escape') {
                onClose();
            }
        };

        const handleInput = () => {
            const scale = textNode.getAbsoluteScale().x;
            textarea.style.width = `${textNode.width() * scale}px`;
            textarea.style.height = 'auto';
            textarea.style.height = `${textarea.scrollHeight + textNode.fontSize()}px`;
        };

        textarea.addEventListener('keydown', handleKeyDown);
        textarea.addEventListener('input', handleInput);
        setTimeout(() => {
            window.addEventListener('click', handleOutsideClick);
        });

        return () => {
            textarea.removeEventListener('keydown', handleKeyDown);
            textarea.removeEventListener('input', handleInput);
            window.removeEventListener('click', handleOutsideClick);
        };
    }, [textNode, onChange, onClose]);

    return (
        <Html>
            <textarea
                ref={textareaRef}
                style={{
                    minHeight: '1em',
                    position: 'absolute',
                }}
            />
        </Html>
    );
};

const EditableText = () => {
    const [text, setText] = useState('Some text here');
    const [isEditing, setIsEditing] = useState(false);
    const [textWidth, setTextWidth] = useState(200);
    const textRef = useRef();
    const trRef = useRef();

    useEffect(() => {
        if (trRef.current && textRef.current) {
            trRef.current.nodes([textRef.current]);
        }
    }, [isEditing]);

    const handleTextDblClick = useCallback(() => {
        setIsEditing(true);
    }, []);

    const handleTextChange = useCallback((newText) => {
        setText(newText);
    }, []);

    const handleTransform = useCallback((e) => {
        const node = textRef.current;
        const scaleX = node.scaleX();
        const newWidth = node.width() * scaleX;
        setTextWidth(newWidth);
        node.setAttrs({
            width: newWidth,
            scaleX: 1,
        });
    }, []);

    return (
        <Stage width={window.innerWidth} height={window.innerHeight}>
            <Layer>
                <Text
                    ref={textRef}
                    text={text}
                    x={50}
                    y={80}
                    fontSize={20}
                    draggable
                    width={textWidth}
                    onDblClick={handleTextDblClick}
                    onDblTap={handleTextDblClick}
                    onTransform={handleTransform}
                    visible={!isEditing}
                />
                {isEditing && (
                    <TextEditor
                        textNode={textRef.current}
                        onChange={handleTextChange}
                        onClose={() => setIsEditing(false)}
                    />
                )}
                {!isEditing && (
                    <Transformer
                        ref={trRef}
                        enabledAnchors={['middle-left', 'middle-right']}
                        boundBoxFunc={(oldBox, newBox) => ({
                            ...newBox,
                            width: Math.max(30, newBox.width),
                        })}
                    />
                )}
            </Layer>
        </Stage>
    );
};

export default EditableText;