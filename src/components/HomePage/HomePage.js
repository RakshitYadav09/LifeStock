import React, { useEffect, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { Link } from 'react-router-dom';
import backgroundImage from '../../assets/images/434508aba04beb9ef9b9c394f29e04f1.png';
import logoImage from '../../assets/images/LifeStock.svg';

// Animation keyframes
const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

const slideUp = keyframes`
  from {
    transform: translateY(30px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
`;

const HomePageContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background-color: #004d40;
  position: relative;
  text-align: center;
  padding: 0 20px;
  
  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url(${backgroundImage}) no-repeat center center;
    background-size: cover;
    mix-blend-mode: hard-light;
    z-index: 0;
    animation: ${fadeIn} 1.5s ease-out;
  }
`;

const ContentWrapper = styled.div`
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const LogoImage = styled.img`
  width: 120%;
  max-width: 800px;
  height: auto;
  margin-bottom: 20px;
  opacity: 0;
  animation: ${fadeIn} 1s ease-out forwards;
  animation-delay: 0.3s;

  @media (max-width: 1200px) {
    width: 100%;
    max-width: 700px;
  }

  @media (max-width: 992px) {
    width: 80%;
    max-width: 600px;
  }
`;

const Tagline = styled.p`
  font-family: 'Georgia', serif;
  font-size: 30px;
  font-weight: 200;
  color: #9AC0B5;
  margin-bottom: 30px;
  opacity: 0;
  animation: ${slideUp} 1s ease-out forwards;
  animation-delay: 0.8s;
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 20px;
  opacity: 0;
  animation: ${slideUp} 1s ease-out forwards;
  animation-delay: 1.2s;
`;

const Button = styled.button`
  background-color: transparent;
  color: #D3FFF2;
  border: 2px solid #D3FFF2;
  border-radius: 30px;
  padding: 12px 40px;
  font-size: 1.1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  width: 200px;

  &:hover {
    background-color: rgba(255, 255, 255, 0.15);
    transform: scale(1.05);
  }
`;

const HomePage = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  
  useEffect(() => {
    // Set a small timeout to ensure animations trigger after component mount
    setTimeout(() => {
      setIsLoaded(true);
    }, 100);
  }, []);

  return (
    <HomePageContainer>
      <ContentWrapper>
        <LogoImage src={logoImage} alt="LifeStock Logo" />
        <Tagline>your grocery needs simplified</Tagline>

        <ButtonContainer>
          <Link to="/learn-more" style={{ textDecoration: 'none' }}>
            <Button>Learn More</Button>
          </Link>

          <Link to="/signup" style={{ textDecoration: 'none' }}>
            <Button>Sign Up</Button>
          </Link>
        </ButtonContainer>
      </ContentWrapper>
    </HomePageContainer>
  );
};

export default HomePage;