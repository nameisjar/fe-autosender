// Import all images from assets
import headerImage from '../assets/cellImage_1836760394_0.jpg';
import trophyImage from '../assets/cellImage_1836760394_1.jpg';
import moduleImage from '../assets/cellImage_1836760394_3.jpg';
import giftImage from '../assets/cellImage_1836760394_5.jpg';
import jalurPendidikanImage from '../assets/gambar jalur pendidikan.jpeg';
import feedbackImage from '../assets/cellImage_1836760394_7.jpg';
import linkImage from '../assets/cellImage_1836760394_8.jpg';
import skillsImage from '../assets/cellImage_1836760394_6.jpg';
import aboutModuleImage from '../assets/cellImage_1836760394_5.jpg';
import freeLessonGiftImage from '../assets/cellImage_1836760394_3.jpg';

// Export images object
const images = {
  header: headerImage,
  trophy: trophyImage,
  module: moduleImage,
  gift: giftImage,
  jalurPendidikan: jalurPendidikanImage,
  feedback: feedbackImage,
  link: linkImage,
  skills: skillsImage,
  aboutModule: aboutModuleImage,
  freeLessonGift: freeLessonGiftImage
};

// Function to convert image URL to base64
export const imageToBase64 = (url) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        const base64 = canvas.toDataURL('image/jpeg', 0.9);
        resolve(base64);
      } catch (error) {
        console.error('Error converting to base64:', error);
        resolve(url); // Fallback to original URL
      }
    };
    
    img.onerror = (error) => {
      console.error('Error loading image:', error);
      resolve(url); // Fallback to original URL
    };
    
    img.src = url;
  });
};

// Function to get all images as base64 for PDF generation
export const getImagesAsBase64 = async () => {
  const base64Images = {};
  
  for (const [key, url] of Object.entries(images)) {
    try {
      base64Images[key] = await imageToBase64(url);
    } catch (error) {
      console.error(`Error converting ${key}:`, error);
      base64Images[key] = url;
    }
  }
  
  return base64Images;
};

// Function to replace all images in HTML element with base64
export const replaceImagesWithBase64 = async (element) => {
  const imgs = element.querySelectorAll('img');
  const promises = [];

  imgs.forEach((img) => {
    const promise = (async () => {
      try {
        const src = img.src || img.getAttribute('src');
        if (src) {
          const base64 = await imageToBase64(src);
          img.setAttribute('src', base64);
          img.src = base64;
        }
      } catch (error) {
        console.error('Error replacing image:', error);
      }
    })();
    promises.push(promise);
  });

  await Promise.all(promises);
};

export default images;
