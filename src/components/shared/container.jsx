import styled from 'styled-components';

const Container = styled.div`
  padding-left: 15px;
  padding-right: 15px;
  margin-left: auto;
  margin-right: auto;

  @media (min-width: 768px) {
    max-width: 750px;
  }

  @media (min-width: 992px) {
    max-width: 970px;
  }

  @media (min-width: 1200px) {
    max-width: 1170px;
  }
`;

export default Container;
