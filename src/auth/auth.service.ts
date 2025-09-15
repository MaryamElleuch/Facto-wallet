import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as nodemailer from 'nodemailer';
import * as jwt from 'jsonwebtoken';
import * as crypto from 'crypto';
import { User } from 'src/users/user.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async register(
    username: string,
    email: string,
    password: string,
  ): Promise<User> {
    const existingUser = await this.userRepository.findOne({
      where: { email },
    });
    if (existingUser) {
      throw new BadRequestException('Email déjà utilisé');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const validationToken = crypto.randomBytes(16).toString('hex');
    console.log('Token généré:', validationToken);

    const user = this.userRepository.create({
      username,
      email,
      password: hashedPassword,
      isValidated: false,
      validationToken,
    });
    await this.sendValidationEmail(email, validationToken);
    return this.userRepository.save(user);
  }

  private async sendValidationEmail(email: string, token: string) {
    console.log('Token envoyé dans le mail:', token);
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'mariemelleuch20@gmail.com',
        pass: 'kocn tprq lesr iuch',
      },
    });
    await transporter.sendMail({
      from: 'mariemelleuch20@gmail.com',
      to: email,
      subject: 'Valide ton compte',
      html: `<a href="http://localhost:3000/auth/validate?token=${token}">Clique ici pour valider</a>`,
    });
  }

  async findUserByValidationToken(token: string): Promise<User | null> {
    return this.userRepository.findOneBy({ validationToken: token });
  }

  async validateUser(
    token: string,
  ): Promise<{ user: User | null; error?: string }> {
    console.log('Recherche user avec token:', token);
    const user = await this.findUserByValidationToken(token);
    if (!user) {
      console.log('Aucun user trouvé avec ce token');
      return { user: null, error: 'no_user' };
    }
    if (user.isValidated) {
      console.log('User déjà validé');
      return { user: null, error: 'already_validated' };
    }
    user.isValidated = true;
    user.validationToken = null;
    await this.userRepository.save(user);
    console.log('User validé:', user.id);
    return { user };
  }

  async login(
    email: string,
    password: string,
  ): Promise<{ accessToken: string } | null> {
    const user = await this.userRepository.findOneBy({ email });
    if (!user || !user.isValidated) {
      return null;
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return null;
    }
    const payload = { sub: user.id, email: user.email };
    const accessToken = jwt.sign(
      payload,
      process.env.JWT_SECRET || 'secretkey',
      { expiresIn: '1h' },
    );
    return { accessToken };
  }
}
