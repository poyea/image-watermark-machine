import React, { useEffect, useRef, useState } from 'react';
import Buttons from './components/Buttons';
import Dragover from './components/Dragover';
import styles from './styles/Home.module.css';
import { rrgb, toRGB } from './utils/color.js';

const WATERMARK_STRING = `Copyright © ${new Date().getFullYear()} J. All Rights Reserved.     `.repeat(
  100
);
const WATERMARK_FILLSTYLE = rrgb() ?? '#008cff';
const WATERMARK_LINESTYLE = '#ffffff';

const Home = () => {
  /*
   * Sticky header hooks.
   */
  const refStickyContainer = useRef(null);
  const [isSticky, setSticky] = useState(false);
  /*
   * Files hooks for processing.
   */
  const [files, setFiles] = useState({});
  const [filesArray, setFilesArray] = useState([]);

  const [isDragFocus, setDragFocus] = useState(false);

  const [isDrawn, setDrawn] = useState(false);

  const [localWaterMark, setLocalWaterMark] = useState(WATERMARK_STRING);

  const [localColor, setLocalColor] = useState(WATERMARK_FILLSTYLE);

  const addTextToImage = (imagePath, text, id) => {
    let toModifyCanvas = document.getElementById(id);
    let context = toModifyCanvas.getContext('2d');
    let img = new Image();
    img.src = imagePath;
    img.onload = () => {
      toModifyCanvas.width = img.width;
      toModifyCanvas.height = img.height;
      context.drawImage(img, 0, 0);
      context.lineWidth = 1;
      context.fillStyle = toRGB(localColor);
      context.lineStyle = WATERMARK_LINESTYLE;
      context.font = `${toModifyCanvas.height / 10}px serif`;
      // context.rotate(Math.PI / 4);
      context.fillText(text, 0, 0);
      /*
       * Drawings
       */
      for (let mul = -1; mul <= 1; mul += 2) {
        for (
          let xTran = 0, yTran = 0, count = toModifyCanvas.width / 200;
          count >= 2;
          count -= 1
        ) {
          context.save();
          context.translate(xTran, yTran);
          context.fillText(text, 0, 0);
          context.restore();
          yTran -= (toModifyCanvas.height / count) * mul;
        }
      }
    };
  };

  const handleScroll = () => {
    if (refStickyContainer.current) {
      setSticky(refStickyContainer.current.getBoundingClientRect().top <= 0);
    }
  };

  const applyWaterMark = () => {
    filesArray.forEach((file, idx) => {
      addTextToImage(URL.createObjectURL(file), localWaterMark, idx);
    });
    setDrawn(true);
  };

  const clearDesk = () => {
    for (let i = 0; i < filesArray.length; ++i) {
      let toModifyCanvas = document.getElementById(i);
      let context = toModifyCanvas.getContext('2d');
      context.clearRect(0, 0, toModifyCanvas.width, toModifyCanvas.height);
    }
    setFiles({});
    setFilesArray([]);
    setDrawn(false);
  };

  const downloadImages = () => {
    for (let i = 0; i < filesArray.length && isDrawn; ++i) {
      let link = document.createElement('a');
      const filename = files[i]['name'];
      const extension = filename.substring(filename.lastIndexOf('.') + 1);
      const name = filename.substring(0, filename.lastIndexOf('.'));
      link.download = `${name}_watermarked.${extension}`;
      link.href = document.getElementById(i).toDataURL();
      link.click();
    }
  };

  const handleDragEnter = () => {
    setDragFocus(true);
  };

  const handleDragExit = () => {
    setDragFocus(false);
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('dragover', (evt) => {
      handleDragEnter();
      evt.preventDefault();
    });
    window.addEventListener('dragover', (evt) => {
      handleDragEnter();
      evt.preventDefault();
    });
    window.addEventListener('drop', (evt) => {
      handleDragExit();
      setFiles(evt.dataTransfer.files);
      handleUploadFiles(evt.dataTransfer.files);
      evt.preventDefault();
    });
    window.addEventListener('dragleave', (evt) => {
      handleDragExit();
      evt.preventDefault();
    });
    document.title = 'Image Watermarker';
    return () => {
      window.removeEventListener('scroll', () => handleScroll);
    };
  }, []);

  // useEffect(() => {
  //   console.log(files);
  // }, [files]);

  const handleUploadFiles = (files) => {
    if (files.length === 0) {
      return;
    }
    setFiles(files);
    let filesArray = [];
    for (let i = 0; i < files.length; ++i) {
      filesArray.push(files[i]);
    }
    setFilesArray(filesArray);
  };

  const handleInput = (value) => {
    setLocalWaterMark(value);
  };

  const handleColor = (value) => {
    setLocalColor(value);
  };

  return (
    <>
      <main className={styles.main} id="main">
        <div
          ref={refStickyContainer}
          className={`
            ${isSticky ? styles.stickybanner : ''}
            `}
        >
          <h1
            className={`
            ${styles.title} ${
              isSticky ? styles.sticky + ' ' + styles.wrapper : ''
            }
            `}
          >
            Image Watermarker
          </h1>
        </div>
        <p className={styles.description}>
          <input
            type="file"
            id="input"
            files={filesArray}
            accept="image/*"
            multiple
            onChange={(e) => handleUploadFiles(e.target.files)}
          />
          <br />
          <input
            className={styles.input}
            type="text"
            value={localWaterMark}
            onChange={(v) => handleInput(v.target.value)}
          ></input>
          <input
            className={styles.color}
            type="color"
            value={localColor}
            onChange={(v) => handleColor(v.target.value)}
          ></input>
        </p>
        {filesArray.length > 0 &&
          filesArray.map((file, idx) => (
            <div key={idx}>
              <img
                id={'img' + idx}
                alt={file['name']}
                src={URL.createObjectURL(file)}
                className={styles.img + (!isDrawn ? '' : ` ${styles.hidden}`)}
              ></img>
              <canvas
                id={idx}
                className={styles.img + (!isDrawn ? ` ${styles.hidden}` : '')}
              ></canvas>
            </div>
          ))}
        {filesArray.length === 0 && <Dragover isDragFocus={isDragFocus} />}
      </main>
      <footer className={styles.footer}>
        <a
          href="https://github.com/poyea"
          target="_blank"
          rel="noopener noreferrer"
        >
          dev @poyea - {new Date().getFullYear()}
        </a>
        <hr></hr>
        <a
          href="https://github.com/poyea"
          target="_blank"
          rel="noopener noreferrer"
        >
          {filesArray.length === 0 && (
            <img
              alt="@poyea"
              src="https://avatars3.githubusercontent.com/u/24757020"
            ></img>
          )}
        </a>
      </footer>

      <Buttons
        clearDesk={clearDesk}
        applyWaterMark={applyWaterMark}
        downloadImages={downloadImages}
      />
    </>
  );
};

export default Home;
