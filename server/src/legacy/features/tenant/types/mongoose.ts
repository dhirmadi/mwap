/** @deprecated Use equivalent functionality from v2 modules instead. This module will be removed in a future release. */

import { Document } from 'mongoose';
import { Integration } from './api';

export interface IntegrationDocument extends Document, Integration {}