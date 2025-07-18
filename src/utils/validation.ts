import Joi from 'joi';

export const createUserSchema = Joi.object({
    email: Joi.string().email().required(),
    firstName: Joi.string().min(2).max(100).required(),
    lastName: Joi.string().min(2).max(100).required(),
    phone: Joi.string().optional()
});

export const fundWalletSchema = Joi.object({
    amount: Joi.number().positive().precision(2).required(),
    description: Joi.string().optional()
});

export const transferSchema = Joi.object({
  recipientAccountNumber: Joi.string().length(10).required(),
  amount: Joi.number().positive().required(),
  description: Joi.string().optional()
});

export const withdrawSchema = Joi.object({
    amount: Joi.number().positive().precision(2).required(),
    description: Joi.string().optional()
});