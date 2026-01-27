import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

// Função para validar CNPJ
const validateCNPJ = (cnpj) => {
    const cleanCNPJ = cnpj.replace(/[^\d]/g, '');
    if (cleanCNPJ.length !== 14) return false;
    
    // Verifica se todos os dígitos são iguais
    if (/^(\d)\1+$/.test(cleanCNPJ)) return false;
    
    // Validação dos dígitos verificadores
    let length = cleanCNPJ.length - 2;
    let numbers = cleanCNPJ.substring(0, length);
    let digits = cleanCNPJ.substring(length);
    let sum = 0;
    let pos = length - 7;
    
    for (let i = length; i >= 1; i--) {
        sum += numbers.charAt(length - i) * pos--;
        if (pos < 2) pos = 9;
    }
    
    let result = sum % 11 < 2 ? 0 : 11 - sum % 11;
    if (result != digits.charAt(0)) return false;
    
    length = length + 1;
    numbers = cleanCNPJ.substring(0, length);
    sum = 0;
    pos = length - 7;
    
    for (let i = length; i >= 1; i--) {
        sum += numbers.charAt(length - i) * pos--;
        if (pos < 2) pos = 9;
    }
    
    result = sum % 11 < 2 ? 0 : 11 - sum % 11;
    if (result != digits.charAt(1)) return false;
    
    return true;
};

// Função para formatar CNPJ
export const formatCNPJ = (cnpj) => {
    const cleanCNPJ = cnpj.replace(/[^\d]/g, '');
    if (cleanCNPJ.length <= 14) {
        return cleanCNPJ
            .replace(/(\d{2})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d)/, '$1/$2')
            .replace(/(\d{4})(\d)/, '$1-$2')
            .replace(/(-\d{2})\d+?$/, '$1');
    }
    return cnpj;
};

// Função para formatar telefone
export const formatPhone = (phone) => {
    const cleanPhone = phone.replace(/[^\d]/g, '');
    if (cleanPhone.length <= 11) {
        return cleanPhone
            .replace(/(\d{2})(\d)/, '($1) $2')
            .replace(/(\d{4,5})(\d{4})$/, '$1-$2');
    }
    return phone;
};

// Função para formatar CEP
export const formatCEP = (cep) => {
    const cleanCEP = cep.replace(/[^\d]/g, '');
    if (cleanCEP.length <= 8) {
        return cleanCEP.replace(/(\d{5})(\d)/, '$1-$2');
    }
    return cep;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Inicializar usuário de teste e carregar usuário do localStorage
    useEffect(() => {
        // Criar usuário de teste se não existir
        const existingUsers = JSON.parse(localStorage.getItem('users') || '[]');
        const testUserExists = existingUsers.some(u => u.email === 'teste');
        
        if (!testUserExists) {
            const testUser = {
                id: 'test-user-001',
                razaoSocial: 'Empresa Teste Ltda',
                nomeFantasia: 'Empresa Teste',
                cnpj: '12345678000190', // CNPJ válido para teste
                inscricaoEstadual: null,
                email: 'teste',
                telefone: '83999999999',
                endereco: {
                    cep: '58000000',
                    logradouro: 'Rua Teste',
                    numero: '123',
                    complemento: '',
                    bairro: 'Centro',
                    cidade: 'João Pessoa',
                    uf: 'PB'
                },
                password: '123',
                createdAt: new Date().toISOString(),
                role: 'empreendedor'
            };
            
            existingUsers.push(testUser);
            localStorage.setItem('users', JSON.stringify(existingUsers));
        }

        // Carregar usuário logado
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (error) {
                console.error('Erro ao carregar usuário:', error);
                localStorage.removeItem('user');
            }
        }
        setLoading(false);
    }, []);

    const register = async (userData) => {
        // Validações
        if (!userData.razaoSocial || !userData.razaoSocial.trim()) {
            throw new Error('Razão Social é obrigatória');
        }

        if (!userData.cnpj) {
            throw new Error('CNPJ é obrigatório');
        }

        const cleanCNPJ = userData.cnpj.replace(/[^\d]/g, '');
        if (!validateCNPJ(cleanCNPJ)) {
            throw new Error('CNPJ inválido');
        }

        if (!userData.email || !userData.email.includes('@')) {
            throw new Error('Email inválido');
        }

        if (!userData.password || userData.password.length < 6) {
            throw new Error('Senha deve ter no mínimo 6 caracteres');
        }

        if (userData.password !== userData.confirmPassword) {
            throw new Error('As senhas não coincidem');
        }

        // Verificar se já existe usuário com este CNPJ ou email
        const existingUsers = JSON.parse(localStorage.getItem('users') || '[]');
        const cnpjExists = existingUsers.some(
            u => u.cnpj.replace(/[^\d]/g, '') === cleanCNPJ
        );
        const emailExists = existingUsers.some(
            u => u.email.toLowerCase() === userData.email.toLowerCase()
        );

        if (cnpjExists) {
            throw new Error('Já existe um cadastro com este CNPJ');
        }

        if (emailExists) {
            throw new Error('Já existe um cadastro com este email');
        }

        // Criar novo usuário
        const newUser = {
            id: Date.now().toString(),
            razaoSocial: userData.razaoSocial.trim(),
            nomeFantasia: userData.nomeFantasia?.trim() || userData.razaoSocial.trim(),
            cnpj: cleanCNPJ,
            inscricaoEstadual: userData.inscricaoEstadual?.replace(/[^\d]/g, '') || null,
            email: userData.email.toLowerCase().trim(),
            telefone: userData.telefone.replace(/[^\d]/g, ''),
            endereco: {
                cep: userData.cep?.replace(/[^\d]/g, '') || '',
                logradouro: userData.logradouro?.trim() || '',
                numero: userData.numero?.trim() || '',
                complemento: userData.complemento?.trim() || '',
                bairro: userData.bairro?.trim() || '',
                cidade: userData.cidade?.trim() || '',
                uf: userData.uf?.trim().toUpperCase() || ''
            },
            password: userData.password, // Em produção, isso deve ser hash
            createdAt: new Date().toISOString(),
            role: 'empreendedor'
        };

        // Salvar usuário
        existingUsers.push(newUser);
        localStorage.setItem('users', JSON.stringify(existingUsers));

        // Fazer login automático
        const { password, ...userWithoutPassword } = newUser;
        setUser(userWithoutPassword);
        localStorage.setItem('user', JSON.stringify(userWithoutPassword));

        return userWithoutPassword;
    };

    const login = async (email, password) => {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const foundUser = users.find(
            u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
        );

        if (!foundUser) {
            throw new Error('Email ou senha incorretos');
        }

        const { password: _, ...userWithoutPassword } = foundUser;
        setUser(userWithoutPassword);
        localStorage.setItem('user', JSON.stringify(userWithoutPassword));

        return userWithoutPassword;
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('user');
    };

    const updateUser = (updatedData) => {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const userIndex = users.findIndex(u => u.id === user.id);
        
        if (userIndex !== -1) {
            const updatedUser = { ...users[userIndex], ...updatedData };
            const { password, ...userWithoutPassword } = updatedUser;
            
            users[userIndex] = updatedUser;
            localStorage.setItem('users', JSON.stringify(users));
            
            setUser(userWithoutPassword);
            localStorage.setItem('user', JSON.stringify(userWithoutPassword));
        }
    };

    return (
        <AuthContext.Provider value={{
            user,
            loading,
            register,
            login,
            logout,
            updateUser,
            isAuthenticated: !!user
        }}>
            {children}
        </AuthContext.Provider>
    );
};
