import { useState } from 'react';

export const useModal = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState(null);
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedMake, setSelectedMake] = useState(null);
  const [selectedSummaryModel, setSelectedSummaryModel] = useState(null);

  const openModal = (content) => {
    setModalContent(content);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setModalContent(null);
    setSelectedClass(null);
    setSelectedMake(null);
    setSelectedSummaryModel(null);
  };

  return {
    modalOpen,
    setModalOpen,
    modalContent,
    setModalContent,
    selectedClass,
    setSelectedClass,
    selectedMake,
    setSelectedMake,
    selectedSummaryModel,
    setSelectedSummaryModel,
    openModal,
    closeModal
  };
};