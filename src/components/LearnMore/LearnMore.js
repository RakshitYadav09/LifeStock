import React, { useEffect, useState } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { Link } from 'react-router-dom';
import { Film } from 'lucide-react';
import logoImage from '../../assets/images/LifeStockDark.svg';

// Animation keyframes
const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

const scaleIn = keyframes`
  from {
    transform: scale(0.8);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
`;

// Animation mixin - using css helper function
const animationMixin = (delay = 0) => css`
  animation: ${fadeInUp} 0.8s ease-out ${delay}s both;
  opacity: 0;
`;

const LearnMoreContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #e0f7f0;
  position: relative;
  justify-content: center;
  align-items: center;
  padding-top: 40px;
  animation: ${fadeIn} 1s ease-out forwards;
`;

const ContentContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
  max-width: 1200px;
  padding: 32px;
  
  @media (min-width: 768px) {
    flex-direction: row;
  }
`;

const LeftSection = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-bottom: 40px;
  text-align: center;
  
  @media (min-width: 768px) {
    margin-bottom: 0;
    margin-right: 40px;
    align-items: flex-start;
    text-align: left;
  }
`;

const LogoImage = styled.img`
  width: 500px;
  height: auto;
  margin-bottom: 24px;
  animation: ${scaleIn} 0.8s ease-out 0.2s both;
  opacity: 0;
`;

const Subtitle = styled.p`
  font-size: 1.2rem;
  line-height: 1.5;
  color: #1d4d4f;
  margin-bottom: 32px;
  max-width: 500px;
  ${animationMixin(0.5)};
`;

const GetStartedButton = styled.button`
  background-color: #1d4d4f;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px 24px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 6px rgba(29, 77, 79, 0.1);
  ${animationMixin(0.7)};
  
  &:hover {
    background-color: #163638;
    transform: translateY(-2px);
    box-shadow: 0 6px 12px rgba(29, 77, 79, 0.15);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const RightSection = styled.div`
  flex: 1;
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;
  justify-items: center;
  justify-content: center;
  
  @media (min-width: 768px) {
    grid-template-columns: 1fr 1fr;
    gap: 24px 32px;
    align-items: start;
  }
`;

const FeatureCard = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 28px 24px;
  background-color: #e0f7f0;
  border-radius: 12px;
  width: 100%;
  max-width: 280px;
  box-shadow: 0 8px 20px rgba(29, 77, 79, 0.08);
  transition: all 0.3s ease;
  border: 1px solid rgba(29, 77, 79, 0.05);
  opacity: 0;
  
  &:hover {
    transform: translateY(-6px) !important;
    box-shadow: 0 12px 24px rgba(29, 77, 79, 0.12);
    background-color: rgba(255, 255, 255, 0.7);
  }
`;

const FeatureIcon = styled.div`
  color: #1d4d4f;
  margin-bottom: 16px;
  background-color: rgba(29, 77, 79, 0.08);
  padding: 16px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: all 0.3s ease;
  
  ${FeatureCard}:hover & {
    background-color: rgba(29, 77, 79, 0.12);
    transform: scale(1.05);
  }
`;

const FeatureTitle = styled.h3`
  font-size: 1.4rem;
  font-weight: 600;
  color: #1d4d4f;
  margin-bottom: 12px;
  text-align: center;
`;

const FeatureDescription = styled.p`
  font-size: 1rem;
  line-height: 1.5;
  color: #1d4d4f;
  text-align: center;
`;

// Create a custom component for each feature card with proper animation
const StaggeredFeatureCard = ({ icon, title, description, translateY, animationDelay }) => {
  // Using inline styles to apply animations instead of injecting via styled-components
  const [animationStyle, setAnimationStyle] = useState({
    transform: `translateY(${translateY}px)`,
    opacity: 0
  });
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimationStyle({
        transform: `translateY(${translateY}px)`,
        opacity: 1,
        transition: `opacity 0.8s ease-out, transform 0.8s ease-out`
      });
    }, animationDelay * 1000);
    
    return () => clearTimeout(timer);
  }, [animationDelay, translateY]);
  
  return (
    <FeatureCard style={animationStyle}>
      <FeatureIcon>
        {icon}
      </FeatureIcon>
      <FeatureTitle>{title}</FeatureTitle>
      <FeatureDescription>
        {description}
      </FeatureDescription>
    </FeatureCard>
  );
};

const LearnMorePage = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  
  useEffect(() => {
    setIsLoaded(true);
  }, []);
  
  return (
    <LearnMoreContainer style={{ opacity: isLoaded ? 1 : 0 }}>
      <ContentContainer>
        <LeftSection>
          <LogoImage src={logoImage} alt="LifeStock Logo" />
          <Subtitle>
            Transform your kitchen with LifeStock, where AI turns your receipts into smart shopping plans and perfect recipes. Welcome to effortless grocery management.
          </Subtitle>
          <Link to="/signup" style={{ textDecoration: 'none' }}>
            <GetStartedButton>Get Started Now</GetStartedButton>
          </Link>
        </LeftSection>
        
        <RightSection>
          <StaggeredFeatureCard 
            icon={<Film size={32} />}
            title="Smart Inventory"
            description="Automatically track and organize your kitchen supplies with AI-powered receipt scanning and intelligent inventory management."
            translateY={-30}
            animationDelay={0.9}
          />
          
          <StaggeredFeatureCard 
            icon={<Film size={32} />}
            title="Recipe Suggestions"
            description="Get personalized recipe recommendations based on what you already have in your kitchen to reduce food waste."
            translateY={30}
            animationDelay={1.1}
          />
          
          <StaggeredFeatureCard 
            icon={<Film size={32} />}
            title="Shopping Lists"
            description="Create smart shopping lists that optimize your grocery runs and ensure you never forget essential items again."
            translateY={-30}
            animationDelay={1.3}
          />
          
          <StaggeredFeatureCard 
            icon={<Film size={32} />}
            title="Budget Tracking"
            description="Monitor your grocery spending with detailed insights and suggestions to help you save money while eating better."
            translateY={30}
            animationDelay={1.5}
          />
        </RightSection>
      </ContentContainer>
    </LearnMoreContainer>
  );
};

export default LearnMorePage;