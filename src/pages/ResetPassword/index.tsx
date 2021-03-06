import React, { useCallback, useRef } from 'react';
import { Link, useHistory, useLocation } from 'react-router-dom';
import { FiArrowLeft, FiLock } from 'react-icons/fi';
import { FormHandles } from '@unform/core';
import { Form } from '@unform/web';
import * as Yup from 'yup';

import { useToast } from '../../context/ToastContext';
import getValidationErrors from '../../utils/getValidationErrors';

import logoImg from '../../assets/logo.svg';

import Input from '../../components/Input';
import Button from '../../components/Button';

import { Container, Content, AnimationContainer, Background } from './styles';
import api from '../../services/api';

interface ResetPasswordFormData {
  password: string;
  password_confirmation: string;
}

const ResetPassword: React.FC = () => {
  const formRef = useRef<FormHandles>(null);
  const history = useHistory();
  const location = useLocation();
  const { addToast } = useToast();

  const handleSubmit = useCallback(async (data: ResetPasswordFormData) => {
    try {
      console.log('aqui');
      formRef.current?.setErrors({});

      const schema = Yup.object().shape({
        password: Yup.string().required('A senha é obrigatória'),
        passwordConfirmation: Yup.string()
          .oneOf([Yup.ref('password')])
          .required('Confirmação de senha inválida'),
      });

      await schema.validate(data, {
        abortEarly: false,
      });

      const { password, password_confirmation } = data;
        const token = location.search.replace('?token=', '');

        if (!token) {
          throw new Error();
        }

        await api.post('/password/reset', {
          password,
          password_confirmation,
          token,
        });

      history.push('/');

    } catch (err) {
        if (err instanceof Yup.ValidationError) {
          const errors = getValidationErrors(err);
          formRef.current?.setErrors(errors);

          return;
        }

      addToast({
        type: 'error',
        title: 'Erro ao resetar senha',
        description: 'Ocorreu um erro ao resetar sua senha, tente novamente',
        });
      }
    }, [addToast, history, location.search],
  );

  return (
    <Container>
      <Content>
        <AnimationContainer>
          <img src={logoImg} alt="Gobarber" />

          <Form ref={formRef} onSubmit={handleSubmit}>
            <h1>Resetar senha</h1>
            <Input name="password" icon={FiLock} type="password" placeholder="Nova senha" />
            <Input name="password_confirmation" icon={FiLock} type="password" placeholder="Confirmação de senha" />
            <Button type="submit">Alterar senha</Button>
          </Form>
          <Link to="/">
            <FiArrowLeft />
            Já tem uma conta? Faça logon aqui.
          </Link>
        </AnimationContainer>
      </Content>
      <Background />
    </Container>
  );
};

export default ResetPassword;
