import React from 'react';

export const colorizeInvygoYelo = (text) => {
  if (!text) return '';
  return text.split(' ').map((word, index) => {
    if (word.toLowerCase().includes('invygo')) {
      return <span key={index} style={{ color: '#7b1fa2', fontWeight: 'bold' }}>{word}</span>;
    } else if (word.toLowerCase().includes('yelo')) {
      return <span key={index} style={{ color: '#ffb300', fontWeight: 'bold' }}>{word}</span>;
    }
    return word;
  }).reduce((prev, curr) => [prev, ' ', curr]);
};
