import { Document } from 'mongoose';
import { Integration } from './api';

export interface IntegrationDocument extends Document, Integration {}